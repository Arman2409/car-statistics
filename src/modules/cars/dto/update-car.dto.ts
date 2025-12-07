import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';

export class UpdateCarDto extends PartialType(CreateCarDto) {}
