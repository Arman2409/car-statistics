// src/modules/cars/utils/percentage.helpers.ts
import { roundToPrecision } from '@/shared/utils/math';
import type { GroupedCountResult } from '@/modules/cars/types/GroupedCountResult';
import type { CalculatedPercentageResult } from '@/modules/cars/types/CalculatedPercentageResult';
import type { Car } from '@/modules/cars/entities/car.entity';
import type { Repository } from 'typeorm';

/**
 * Executes a grouped COUNT query against the Car repository.
 * @param carsRepository The TypeORM Repository instance.
 * @param columnName The entity column to group by.
 */
export async function getGroupedCountQuery(
  carsRepository: Repository<Car>,
  columnName: 'normalizedMake' | 'normalizedModel',
): Promise<GroupedCountResult[]> {
  return carsRepository
    .createQueryBuilder('car')
    .select(`car.${columnName}`, 'group')
    .addSelect('COUNT(*)', 'count')
    .groupBy(`car.${columnName}`)
    .orderBy('count', 'DESC')
    .getRawMany();
}

/**
 * Calculates the percentage of each group relative to the total count.
 * @param results The raw results array from the grouped query.
 */
export function calculatePercentageFromGroupedResult(
  results: GroupedCountResult[],
): CalculatedPercentageResult[] {
  if (results.length === 0) return [];

  // Calculate the total by summing all counts
  const total = results.reduce((sum, row) => sum + parseInt(row.count, 10), 0);

  if (total === 0) return [];

  // Map the results to calculate the percentage
  return results.map((row) => ({
    group: row.group,
    percentage: roundToPrecision((parseInt(row.count, 10) / total) * 100, 0.1),
  }));
}
