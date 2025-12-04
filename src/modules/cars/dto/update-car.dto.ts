import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MAKE_API,
  MODEL_API,
  YEAR_API,
  PRICE_API,
  LOCATION_API,
} from '@/modules/cars/docs/create-car.docs';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsObject,
} from 'class-validator';
import { PriceDto } from './create-car.dto';

export class UpdateCarDto {
  @ApiPropertyOptional(MAKE_API)
  @IsString()
  @IsOptional()
  normalizedMake?: string;

  @ApiPropertyOptional(MODEL_API)
  @IsString()
  @IsOptional()
  normalizedModel?: string;

  @ApiPropertyOptional(YEAR_API)
  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  year?: number;

    @ApiProperty(PRICE_API)
    @IsObject()
    @Type(() => PriceDto)
    price: PriceDto;

  @ApiPropertyOptional(LOCATION_API)
  @IsString()
  @IsOptional()
  location?: string;
}
