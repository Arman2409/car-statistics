import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '@/modules/cars/entities/car.entity';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import type { Repository } from 'typeorm';
import { MAKES_CACHE_KEY, MODELS_CACHE_KEY } from './make-seeder.service';
import { RedisService } from '@/modules/redis/redis.service';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    private readonly redisService: RedisService,
  ) {}

  private async validateMakeAndModel(make?: string | undefined, model?: string, isUpdate = false): Promise<{ normalizedMake?: string; normalizedModel?: string }> {
    if (!isUpdate && (!make || !model)) throw new BadRequestException('Make and model are required');

    const cachedMakes = await this.redisService.getClient().get(MAKES_CACHE_KEY);
    const cachedModels = await this.redisService.getClient().get(MODELS_CACHE_KEY);

    if (make && !cachedMakes?.includes(make.toLowerCase())) {
      throw new BadRequestException(`Invalid car make: ${make}`);
    }

    if(model && !cachedModels?.includes(model.toLowerCase())) {
      throw new BadRequestException(`Invalid car model: ${model}`);
    }

    return { 
      ...(make ? { normalizedMake: this.normalizeString(make) } : undefined),
      ...(model ? { normalizedModel: this.normalizeString(model) } : undefined)
     };
  }

  private normalizeString(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  async create({make, model, ...createPayload}: CreateCarDto): Promise<Car> {
    const { normalizedMake, normalizedModel } = await this.validateMakeAndModel(make, model);

    const car = this.carsRepository.create({
      ...createPayload,
      normalizedMake,
      normalizedModel,
    });
    
    return this.carsRepository.save(car);
  }

  async bulkCreate(cars: CreateCarDto[]): Promise<Car[]> {
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
    const { normalizedMake, normalizedModel } = await this.validateMakeAndModel(make, model, true);

    const updateResult = await this.carsRepository.update(id, {
      ...updatePayload,
      normalizedMake,
      normalizedModel,
    });

    return updateResult as Partial<Car>;
  }

  async remove(id: number): Promise<void> {
    await this.carsRepository.delete(id);
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
