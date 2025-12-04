import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '@/modules/cars/entities/car.entity';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import type { Repository } from 'typeorm';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const car = this.carsRepository.create(createCarDto);
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

  async update(id: number, updateCarDto: UpdateCarDto): Promise<Partial<Car>> {
    await this.carsRepository.update(id, updateCarDto);
    return { id, ...updateCarDto };
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
