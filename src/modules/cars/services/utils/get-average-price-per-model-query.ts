import type { Repository } from 'typeorm';
import type { Car } from '@/modules/cars/entities/car.entity';

/**
 * Executes the AVG(price) grouped query and returns raw rows.
 * Caller is expected to parse `averagePrice` into number.
 */
export async function getAveragePricePerModelQuery(
  carsRepository: Repository<Car>,
) {
  return carsRepository
    .createQueryBuilder('car')
    .select('car.normalizedMake', 'make')
    .addSelect('car.normalizedModel', 'model')
    .addSelect('AVG(car.price)', 'averagePrice')
    .groupBy('car.normalizedMake')
    .addGroupBy('car.normalizedModel')
    .orderBy('make')
    .addOrderBy('model')
    .getRawMany();
}
