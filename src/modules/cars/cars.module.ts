import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarsService } from '@/modules/cars/cars.service';
import { CarsController } from '@/modules/cars/cars.controller';
import { Car } from '@/modules/cars/entities/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
