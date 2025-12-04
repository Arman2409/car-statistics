import { ApiProperty } from '@nestjs/swagger';
import {
  PRICE_AMOUNT_API,
  PRICE_CURRENCY_API,
  MAKE_API,
  MODEL_API,
  YEAR_API,
  PRICE_API,
  LOCATION_API,
} from '@/modules/cars/docs/create-car.docs';
import { Type } from 'class-transformer';
import cc from 'currency-codes';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsObject,
  ValidateNested,
  IsIn,
} from 'class-validator';

export class PriceDto {
  @ApiProperty(PRICE_AMOUNT_API)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty(PRICE_CURRENCY_API)
  @IsString()
  @IsNotEmpty()
  @IsIn(cc.codes())
  currency: string;
}

export class CreateCarDto {
  @ApiProperty(MAKE_API)
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty(MODEL_API)
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty(YEAR_API)
  @IsInt()
  @Min(1900)
  @Max(2050)
  year: number;

  @ApiProperty(PRICE_API)
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiProperty(LOCATION_API)
  @IsString()
  @IsNotEmpty()
  location: string;
}
