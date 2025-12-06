import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CarsService } from '@/modules/cars/services/cars.service';
import type { IngestionCarDto } from '@/modules/cars/dto/ingestion-car.dto';

export const BULK_CREATE_QUEUE = 'bulk-create';

@Processor(BULK_CREATE_QUEUE)
export class BulkCreateProcessor {
  private readonly logger = new Logger(BulkCreateProcessor.name);

  constructor(private readonly carsService: CarsService) {}

  @Process('process-bulk')
  async handleBulkCreate(job: Job<IngestionCarDto[]>) {
    try {
      this.logger.log(`Processing bulk create job ${job.id} with ${job.data.length} cars`);
      const result = await this.carsService.processBulkCreate(job.data);
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
}
