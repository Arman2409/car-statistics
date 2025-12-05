import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '@/modules/cars/entities/car.entity';
import { RedisService } from '@/services/redis.service';
import { validateMakeAndModel } from '@/modules/cars/services/utils/validate-make-model';
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
  ) {}

  async create({make, model, ...createPayload}: CreateCarDto): Promise<Car> {
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

  async bulkCreate(cars: any[]): Promise<BulkCreateResponse> {
    console.log("here 1")

    const carsToCreate: Partial<Car>[] = [];
    const errorMessages: {
      index: number;
      message: string;
    }[] = [];

    for(let i = 0; i < cars.length; i++) {
      const { make, model, ...createPayload } = cars[i];

      let normalizedMake: string | undefined;
      let normalizedModel: string | undefined;
      try{
        const result = await validateMakeAndModel({redisService: this.redisService, logger: this.logger, make, model});
        normalizedMake = result.normalizedMake;
        normalizedModel = result.normalizedModel;
      } catch(err){
        errorMessages.push({
          index: i,
          message: (err as Error).message,
        });
        
        continue;
      }

       carsToCreate.push({
        ...createPayload,
        normalizedMake: normalizedMake as string,
        normalizedModel: normalizedModel as string,
      });
    }

    const carEntities = this.carsRepository.create(carsToCreate);

    const createResult = await this.carsRepository.save(carEntities);

    return {
      created: createResult.length,
      failed: errorMessages.length,
      errors: errorMessages,
    }
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
      ...(normalizedMake ? {normalizedMake} : {}),
      ...(normalizedModel ? {normalizedModel} : {}),
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
    const total = await this.carsRepository.count();
    if (total === 0) {
      return [];
    }

    const result = await this.carsRepository
      .createQueryBuilder('car')
      .select('car.normalizedMake', 'make')
      .addSelect('COUNT(*)', 'count')
      .groupBy('car.normalizedMake')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map((row) => ({
      make: row.make,
      percentage: (parseInt(row.count) / total) * 100,
    }));
  }

  async getModelPercentage(): Promise<GetPercentageResponse> {
    const total = await this.carsRepository.count();
    if (total === 0) {
      return [];
    }

    const result = await this.carsRepository
      .createQueryBuilder('car')
      .select('car.normalizedModel', 'model')
      .addSelect('COUNT(*)', 'count')
      .groupBy('car.normalizedModel')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map((row) => ({
      model: row.model,
      percentage: (parseInt(row.count) / total) * 100,
    }));
  }
}
