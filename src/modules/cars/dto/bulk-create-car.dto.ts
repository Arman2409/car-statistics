import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';

export class BulkCreateCarDto {
  @ApiProperty({
    description: 'Array of cars to create',
    type: [CreateCarDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCarDto)
  cars: CreateCarDto[];
}
