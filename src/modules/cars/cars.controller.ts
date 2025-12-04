import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CarsService } from '@/modules/cars/cars.service';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import { BulkCreateCarDto } from '@/modules/cars/dto/bulk-create-car.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Car } from '@/modules/cars/entities/car.entity';

@ApiTags('Cars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new car' })
  @ApiResponse({
    status: 201,
    description: 'Car created successfully',
    type: Car,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCarDto: CreateCarDto): Promise<Car> {
    return this.carsService.create(createCarDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create cars (for data ingestion)' })
  @ApiResponse({
    status: 201,
    description: 'Cars created successfully',
    type: [Car],
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  bulkCreate(@Body() bulkCreateCarDto: BulkCreateCarDto): Promise<Car[]> {
    return this.carsService.bulkCreate(bulkCreateCarDto.cars);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cars' })
  @ApiResponse({
    status: 200,
    description: 'List of all cars',
    type: [Car],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a car by ID' })
  @ApiResponse({
    status: 200,
    description: 'Car found',
    type: Car,
  })
  @ApiResponse({ status: 404, description: 'Car not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Car | null> {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a car' })
  @ApiResponse({
    status: 200,
    description: 'Car updated successfully',
    type: Car,
  })
  @ApiResponse({ status: 404, description: 'Car not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarDto: UpdateCarDto,
  ): Promise<Partial<Car>> {
    return this.carsService.update(id, updateCarDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a car' })
  @ApiResponse({ status: 204, description: 'Car deleted successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carsService.remove(id);
  }

  @Get('stats/average-price-per-model')
  @ApiOperation({
    summary: 'Get average price per model (grouped by make + model)',
  })
  @ApiResponse({
    status: 200,
    description: 'Average price per model',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          make: { type: 'string', example: 'toyota' },
          model: { type: 'string', example: 'corolla' },
          averagePrice: { type: 'number', example: 12000 },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAveragePricePerModel() {
    return this.carsService.getAveragePricePerModel();
  }

  @Get('stats/make-percentage')
  @ApiOperation({ summary: 'Get percentage distribution per make' })
  @ApiResponse({
    status: 200,
    description: 'Percentage distribution per make',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          make: { type: 'string', example: 'toyota' },
          percentage: { type: 'number', example: 25.5 },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMakePercentage() {
    return this.carsService.getMakePercentage();
  }

  @Get('stats/model-percentage')
  @ApiOperation({ summary: 'Get percentage distribution per model' })
  @ApiResponse({
    status: 200,
    description: 'Percentage distribution per model',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          model: { type: 'string', example: 'corolla' },
          percentage: { type: 'number', example: 15.3 },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getModelPercentage() {
    return this.carsService.getModelPercentage();
  }
}
