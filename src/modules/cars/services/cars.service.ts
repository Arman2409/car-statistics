import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '@/modules/cars/entities/car.entity';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import { RedisService } from '@/services/redis.service';
import type { Repository } from 'typeorm';
import { validateMakeAndModel } from '@/modules/cars/services/utils/validate-make-model';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {}

  async create({make, model, ...createPayload}: CreateCarDto): Promise<Car> {
    const { normalizedMake, normalizedModel } = await validateMakeAndModel(this.redisService, this.logger, make, model);

    const car = this.carsRepository.create({
      ...createPayload,
      normalizedMake,
      normalizedModel,
    });
    
    return this.carsRepository.save(car);
  }

  async bulkCreate(cars: CreateCarDto[]): Promise<Car[]> {
    // TODO: This one doesn't have validation 
    const carEntities = this.carsRepository.create(cars);
    return this.carsRepository.save(carEntities);
  }

  async findAll(): Promise<Car[]> {
    return this.carsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Car | null> {
    return this.carsRepository.findOne({ where: { id } });
  }

  async update(id: number, {make, model, ...updatePayload}: UpdateCarDto): Promise<Partial<Car>> {
    const { normalizedMake, normalizedModel } = await validateMakeAndModel(this.redisService,  this.logger, make, model, true);

    const updateResult = await this.carsRepository.update(id, {
      ...updatePayload,
      normalizedMake,
      normalizedModel,
    });

    // TODO the type is wrong here, it doesn't return the updated record
    return updateResult as Partial<Car>;
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.carsRepository.delete(id);

    // If no record was affected, means the car with the given ID does not exist
    if (deleteResult.affected === 0) {
      throw new BadRequestException(`Car with ID ${id} not found`);
    }

    return;
  }

  async getAveragePricePerModel(): Promise<
    Array<{ make: string; model: string; averagePrice: number }>
  > {
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

  async getMakePercentage(): Promise<
    Array<{ make: string; percentage: number }>
  > {
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

  async getModelPercentage(): Promise<
    Array<{ model: string; percentage: number }>
  > {
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
