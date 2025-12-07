import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Car } from '@/modules/cars/entities/car.entity';
import { RedisService } from '@/modules/redis/redis.service';
import { validateMakeAndModel } from '@/modules/cars/services/utils/validate-make-model';
import { PromiseStatus } from '@/shared/constants/PromiseStatus';
import { CacheKeys } from '@/modules/cars/constants/cache';
import type { IngestionCarDto } from '@/modules/cars/dto/ingestion-car.dto';
import type { BulkCreateResponse, BulkCreationError } from '@/modules/cars/types/BulkCreateResponse';
import type { Repository } from 'typeorm';

export const BULK_CREATE_QUEUE = 'bulk-create';
export const BULK_CREATION_OPERATION = 'process-bulk';

@Processor(BULK_CREATE_QUEUE)
export class BulkCreateProcessor {
  private readonly logger = new Logger(BulkCreateProcessor.name);

  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    private readonly redisService: RedisService,
  ) { }

  @Process(BULK_CREATION_OPERATION)
  async handleBulkCreate(job: Job<IngestionCarDto[]>): Promise<BulkCreateResponse> {
    try {
      this.logger.log(`Processing bulk create job ${job.id} with ${job.data.length} cars`);
      const result = await this.processBulkCreate(job.data);
      this.logger.log(
        `Completed bulk create job ${job.id}: ${result.created} created, ${result.failed} failed`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process bulk create job ${job.id}`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  private async processBulkCreate(cars: IngestionCarDto[]): Promise<BulkCreateResponse> {
    this.logger.log(`Starting bulk create for ${cars.length} cars`);

    // Validate all cars in parallel
    const validationResults = await Promise.allSettled(
      cars.map((car) =>
        validateMakeAndModel({
          redisService: this.redisService,
          logger: this.logger,
          make: car.normalizedMake,
          model: car.normalizedModel,
          normalize: false,
        }),
      ),
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
    await this.redisService.invalidateKey(CacheKeys.ALL_CARS);

    const operationResult: BulkCreateResponse = {
      created: carsToInsert.length,
      failed: errors.length,
      errors,
    };

    this.logger.log("Finished bulk create operation", {
      created: carsToInsert.length,
      failed: errors.length,
      errors,
    });

    return operationResult;
  }
}
