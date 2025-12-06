import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { Car } from '@/modules/cars/entities/car.entity';
import { RedisService } from '@/services/redis.service';
import { validateMakeAndModel } from '@/modules/cars/services/utils/validate-make-model';
import { calculatePercentageFromGroupedResult, getGroupedCountQuery } from '@/modules/cars/services/utils/get-grouped-count-query';
import { getAveragePricePerModelQuery } from '@/modules/cars/services/utils/get-average-price-per-model-query';
import type { IngestionCarDto } from '@/modules/cars/dto/ingestion-car.dto';
import { PromiseStatus } from '@/shared/constants/PromiseStatus';
import { SortOrder } from '@/shared/constants/SortOrder';
import { ALL_CARS_TTL_SECONDS, CacheKeys } from '@/modules/cars/constants/cache';
import type { BulkCreateResponse, BulkCreationError } from '@/modules/cars/types/BulkCreateResponse';
import type { Repository } from 'typeorm';
import type { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import type { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import type { GetPercentageResponse } from '@/modules/cars/types/GetPercentageResponse';
import type { GetAveragePricePerModelResponse } from '@/modules/cars/types/GetAveragePricePerModelResponse';

@Injectable()
export class CarsService {  
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
    @InjectQueue('bulk-create')
    private bulkCreateQueue: Queue,
  ) { }

  async create({ make, model, ...createPayload }: CreateCarDto): Promise<Car> {
    const { normalizedMake, normalizedModel } = await validateMakeAndModel({
      redisService: this.redisService,
      logger: this.logger,
      make,
      model,
    }) || {};

    const car = this.carsRepository.create({
      ...createPayload,
      normalizedMake,
      normalizedModel,
    });

    return this.carsRepository.save(car);
  }


  async bulkCreate(cars: IngestionCarDto[]): Promise<void> {
    this.logger.log(`Enqueuing bulk create job for ${cars.length} cars`);
    await this.bulkCreateQueue.add('process-bulk', cars, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async processBulkCreate(cars: IngestionCarDto[]): Promise<BulkCreateResponse> {
    this.logger.log(`Starting bulk create for ${cars.length} cars`);

    // Validate all cars in parallel
    const validationResults = await Promise.allSettled(
      cars.map((car) => validateMakeAndModel({
          redisService: this.redisService,
          logger: this.logger,
          make: car.normalizedMake,
          model: car.normalizedModel,
          normalize: false,
        })
      )
    );

    const carsToInsert: Partial<Car>[] = [];
    const errors: BulkCreationError[] = [];

    validationResults.forEach((result, i) => {
      if (result.status === PromiseStatus.FULFILLED) {
        carsToInsert.push(cars[i]);
      } else {
        errors.push({
          index: i,
          message: (result.reason as Error).message,
        });
      }
    });

    if (carsToInsert.length > 0) {
      const batchSize = 1000;

      for (let i = 0; i < carsToInsert.length; i += batchSize) {
        const batch = carsToInsert.slice(i, i + batchSize);
        await this.carsRepository.insert(batch);
      }
    }

    // Invalidate cached all-cars list after bulk insert
    await this.invalidateAllCarsCache();

    this.logger.log({
      created: carsToInsert.length,
      failed: errors.length,
      errors,
    });

    return {
      created: carsToInsert.length,
      failed: errors.length,
      errors,
    };
  }

  async findAll(): Promise<Car[]> {
    const client = this.redisService?.getClient?.();
    if (client) {
      try {
        const cached = await client.get(CacheKeys.ALL_CARS);
        if (cached) {
          const parsed: Car[] = JSON.parse(cached) as Car[];
          return parsed;
        }
      } catch (err) {
        this.logger?.error('Failed reading from Redis cache', err as Error);
      }
    }

    const cars = await this.carsRepository.find({ order: { createdAt: SortOrder.DESC } });

    if (client) {
      try {
        await client.set(CacheKeys.ALL_CARS, JSON.stringify(cars), 'EX', ALL_CARS_TTL_SECONDS);
      } catch (err) {
        this.logger?.warn('Failed to write cars list to Redis cache');
      }
    }

    return cars;
  }

  async findOne(id: number): Promise<Car | null> {
    return this.carsRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePayload: UpdateCarDto): Promise<Partial<Car>> {
    const { make, model, ...restOfPayload } = updatePayload;

    // Perform validation and normalization using the extracted raw fields
    const { normalizedMake, normalizedModel } = await validateMakeAndModel(
      {
        redisService: this.redisService,
        logger: this.logger,
        make,
        model,
        isUpdate: true,
      }
    ) || {};

    const updateData = {
      ...restOfPayload,
      normalizedMake,
      normalizedModel,
    };

    // 4. Perform the update operation
    const updateResult = await this.carsRepository.update(id, updateData);

    if (updateResult.affected === 0) {
      throw new BadRequestException(`Car with ID ${id} not found`);
    }

    const updatedFields = {
      ...restOfPayload,
      ...(normalizedMake ? { normalizedMake } : {}),
      ...(normalizedModel ? { normalizedModel } : {}),
    }

    return updatedFields;
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.carsRepository.delete(id);

    // If no record was affected, means the car with the given ID does not exist
    if (deleteResult.affected === 0) {
      throw new BadRequestException(`Car with ID ${id} not found`);
    }

    return;
  }

  async getAveragePricePerModel(): Promise<GetAveragePricePerModelResponse> {
    const rows = await getAveragePricePerModelQuery(this.carsRepository);
    return rows.map((row: any) => ({
      make: row.make,
      model: row.model,
      averagePrice: parseFloat(row.averagePrice),
    }));
  }

  async getMakePercentage(): Promise<GetPercentageResponse> {
    const groupedCounts = await getGroupedCountQuery(
      this.carsRepository,
      'normalizedMake',
    );

    const results = calculatePercentageFromGroupedResult(groupedCounts);

    return results.map(row => ({
      make: row.group,
      percentage: row.percentage,
    }));
  }

  async getModelPercentage(): Promise<GetPercentageResponse> {
    const groupedCounts = await getGroupedCountQuery(
      this.carsRepository,
      'normalizedModel',
    );

    const results = calculatePercentageFromGroupedResult(groupedCounts);

    return results.map(row => ({
      model: row.group,
      percentage: row.percentage,
    }));
  }

  private async invalidateAllCarsCache(): Promise<void> {
    try {
      const client = this.redisService?.getClient?.();
      if (client) await client.del(CacheKeys.ALL_CARS);
    } catch (err) {
      this.logger?.warn('Failed to invalidate cars cache');
    }
  }
}

