import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import {
  MAKE_API,
  MODEL_API,
  YEAR_API,
  PRICE_API,
  LOCATION_API,
} from '@/modules/cars/docs/create-car.docs';

export class BulkCreateCarItemDto {
  @ApiProperty(MAKE_API)
  @IsString()
  @IsNotEmpty()
  normalizedMake: string;

  @ApiProperty(MODEL_API)
  @IsString()
  @IsNotEmpty()
  normalizedModel: string;

  @ApiProperty(YEAR_API)
  @IsInt()
  @Min(1900)
  @Max(2050)
  year: number;

  @ApiProperty(PRICE_API)
  @IsNotEmpty()
  @IsInt()
  price: number;

  @ApiProperty(LOCATION_API)
  @IsString()
  @IsNotEmpty()
  location: string;
}
