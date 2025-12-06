import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '@/modules/cars/entities/car.entity';
import { RedisService } from '@/services/redis.service';
import { validateMakeAndModel } from '@/modules/cars/services/utils/validate-make-model';
import { calculatePercentageFromGroupedResult, getGroupedCountQuery } from '@/modules/cars/services/utils/get-grouped-count-query';
import type { BulkCreateResponse } from '@/modules/cars/types/BulkCreateResponse';
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
  ) { }

  async create({ make, model, ...createPayload }: CreateCarDto): Promise<Car> {
    const { normalizedMake, normalizedModel } = await validateMakeAndModel({
      redisService: this.redisService,
      logger: this.logger,
      make,
      model,
    });

    const car = this.carsRepository.create({
      ...createPayload,
      normalizedMake,
      normalizedModel,
    });

    return this.carsRepository.save(car);
  }


  async bulkCreate(cars: CreateCarDto[]): Promise<BulkCreateResponse> {

    // Validate all cars in parallel
    const validationResults = await Promise.allSettled(
      cars.map((car) =>
        validateMakeAndModel({
          redisService: this.redisService,
          logger: this.logger,
          make: car.make,
          model: car.model,
        })
      )
    );

    const carsToInsert: Partial<Car>[] = [];
    const errors: { index: number; message: string }[] = [];

    validationResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const { normalizedMake, normalizedModel } = result.value;
        const { make, model, ...payload } = cars[i];

        carsToInsert.push({
          ...payload,
          normalizedMake,
          normalizedModel,
        });
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

    return {
      created: carsToInsert.length,
      failed: errors.length,
      errors,
    };
  }


  async findAll(): Promise<Car[]> {
    return this.carsRepository.find({
      order: { createdAt: 'DESC' },
    });
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
    );

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
    const result = await this.carsRepository
      .createQueryBuilder('car')
      .select('car.normalizedMake', 'make')
      .addSelect('car.normalizedModel', 'model')
      .addSelect('AVG(car.price)', 'averagePrice')
      .groupBy('car.normalizedMake')
      .addGroupBy('car.normalizedModel')
      .orderBy('make')
      .addOrderBy('model')
      .getRawMany();

    return result.map((row) => ({
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

}
