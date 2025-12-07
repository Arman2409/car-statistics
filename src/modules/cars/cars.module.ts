import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CarsService } from '@/modules/cars/services/cars.service';
import { CarsController } from '@/modules/cars/cars.controller';
import { Car } from '@/modules/cars/entities/car.entity';
import { MakeAndModelSeederService } from '@/modules/cars/services/make-and-model-seeder.service';
import { HttpModule } from '@nestjs/axios';
import {
  BULK_CREATE_QUEUE,
  BulkCreateProcessor,
} from '@/modules/cars/processors/bulk-create.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car]),
    HttpModule.register({}),
    BullModule.registerQueue({
      name: BULK_CREATE_QUEUE,
    }),
  ],
  controllers: [CarsController],
  providers: [
    CarsService,
    MakeAndModelSeederService,
    BulkCreateProcessor,
    Logger,
  ],
})
export class CarsModule {}
