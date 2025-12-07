import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { Car, CAR_PUBLIC_FIELDS } from '@/modules/cars/entities/car.entity';
import { RedisService } from '@/modules/redis/redis.service';
import { getAveragePricePerModelQuery } from './utils/get-average-price-per-model-query';
import { validateMakeAndModel } from '@/modules/cars/services/utils/validate-make-model';
import { calculatePercentageFromGroupedResult, getGroupedCountQuery } from '@/modules/cars/services/utils/get-grouped-count-query';
import { SortOrder } from '@/shared/constants/SortOrder';
import { ALL_CARS_TTL_SECONDS, CacheKeys } from '@/modules/cars/constants/cache';
import { RESPONSE_LIMITS } from '@/modules/cars/constants/limits';
import { BULK_CREATE_QUEUE, BULK_CREATION_OPERATION } from '@/modules/cars/processors/bulk-create.processor';
import { BULK_SETTINGS } from '@/modules/cars/constants/limits';
import { BULK_JOB_OPTIONS } from '@/modules/cars/constants/queue';
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
    @InjectQueue(BULK_CREATE_QUEUE)
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


  async bulkCreate(cars: Partial<Car>[]): Promise<void> {
    this.logger.log(`Enqueuing bulk create job for ${cars.length} cars`);

    const jobChunkSize = BULK_SETTINGS.JOB_CHUNK_SIZE;

    // If payload is small enough, enqueue as a single job
    if (cars.length <= jobChunkSize) {
      await this.bulkCreateQueue.add(BULK_CREATION_OPERATION, cars, BULK_JOB_OPTIONS);
      return;
    }

    // For larger payloads, split into chunks and enqueue each chunk separately
    for (let i = 0; i < cars.length; i += jobChunkSize) {
      const chunk = cars.slice(i, i + jobChunkSize);
      await this.bulkCreateQueue.add(BULK_CREATION_OPERATION, chunk, BULK_JOB_OPTIONS);
    }
  }

  async findAll(): Promise<Car[]> {
    const client = this.redisService?.getClient?.();

    if (client) {
      try {
        const cached = await client.get(CacheKeys.ALL_CARS);
        if (cached) {
          return JSON.parse(cached) as Car[];
        }
      } catch (err) {
        this.logger?.error('Failed reading from Redis cache, continuing', err as Error);
      }
    }

    const cars = await this.carsRepository.find({
      order: { createdAt: SortOrder.DESC },
      select: CAR_PUBLIC_FIELDS,
      take: RESPONSE_LIMITS.ALL_CARS,
    });

    if (client) {
      try {
        await client.set(CacheKeys.ALL_CARS, JSON.stringify(cars), 'EX', ALL_CARS_TTL_SECONDS);
      } catch (err) {
        this.logger?.error('Failed to write cars list to Redis cache');
      }
    }

    return cars;
  }

  async findOne(id: number): Promise<Car | null> {
    return this.carsRepository.findOne({ where: { id }, select: CAR_PUBLIC_FIELDS });
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
    const mappedRows = rows.map((row: any) => ({
      make: row.make,
      model: row.model,
      averagePrice: Math.round(parseFloat(row.averagePrice)),
    }));

    return mappedRows.slice(0, RESPONSE_LIMITS.AVERAGE_PRICE_PER_MODEL);
  }

  async getMakePercentage(): Promise<GetPercentageResponse> {
    const groupedCounts = await getGroupedCountQuery(
      this.carsRepository,
      'normalizedMake',
    );

    const results = calculatePercentageFromGroupedResult(groupedCounts);
    const mappedResults = results.map(row => ({
      make: row.group,
      percentage: row.percentage,
    }));

    return mappedResults.slice(0, RESPONSE_LIMITS.MAKE_PERCENTAGE);
  }

  async getModelPercentage(): Promise<GetPercentageResponse> {
    const groupedCounts = await getGroupedCountQuery(
      this.carsRepository,
      'normalizedModel',
    );

    const results = calculatePercentageFromGroupedResult(groupedCounts);
    const mappedResults = results.map(row => ({
      model: row.group,
      percentage: row.percentage,
    }));

    return mappedResults.slice(0, RESPONSE_LIMITS.MODEL_PERCENTAGE);
  }
}