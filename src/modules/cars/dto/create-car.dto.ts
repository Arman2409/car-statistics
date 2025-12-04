import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateCarDto {
  @ApiProperty({
    description: 'Normalized make of the car',
    example: 'toyota',
  })
  @IsString()
  @IsNotEmpty()
  normalizedMake: string;

  @ApiProperty({
    description: 'Normalized model of the car',
    example: 'corolla',
  })
  @IsString()
  @IsNotEmpty()
  normalizedModel: string;

  @ApiProperty({
    description: 'Year of the car',
    example: 2020,
    minimum: 1900,
    maximum: 2100,
  })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @ApiProperty({
    description: 'Price of the car',
    example: 25000.5,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Location of the car',
    example: 'New York, NY',
  })
  @IsString()
  @IsNotEmpty()
  location: string;
}
