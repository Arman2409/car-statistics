import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarsService } from '@/modules/cars/services/cars.service';
import { CarsController } from '@/modules/cars/cars.controller';
import { Car } from '@/modules/cars/entities/car.entity';
import { MakeSeederService } from '@/modules/cars/services/make-seeder.service';
import { HttpModule } from '@nestjs/axios';
import { RedisService } from '@/services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car]),  HttpModule.register({})],
  controllers: [CarsController],
  providers: [CarsService, MakeSeederService, RedisService, Logger],
  exports: [CarsService, MakeSeederService],
})
export class CarsModule {}



