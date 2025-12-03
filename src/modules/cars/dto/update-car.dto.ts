import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, Min, Max, IsOptional } from 'class-validator';

export class UpdateCarDto {
  @ApiPropertyOptional({
    description: 'Normalized make of the car',
    example: 'toyota',
  })
  @IsString()
  @IsOptional()
  normalizedMake?: string;

  @ApiPropertyOptional({
    description: 'Normalized model of the car',
    example: 'corolla',
  })
  @IsString()
  @IsOptional()
  normalizedModel?: string;

  @ApiPropertyOptional({
    description: 'Year of the car',
    example: 2020,
    minimum: 1900,
    maximum: 2100,
  })
  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({
    description: 'Price of the car',
    example: 25000.50,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Location of the car',
    example: 'New York, NY',
  })
  @IsString()
  @IsOptional()
  location?: string;
}

