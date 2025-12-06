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
import { CARS_TAG, createCarsSwaggerConfig } from '@/modules/cars/docs/cars-swagger.config';
import { CarsService } from '@/modules/cars/services/cars.service';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Car } from '@/modules/cars/entities/car.entity';
import { ApiKeyAuthGuard } from '@/modules/cars/guards/ApiKeyAuthGuard';
import { IngestionCarDto } from '@/modules/cars/dto/ingestion-car.dto';

const swagger = createCarsSwaggerConfig();

@ApiTags(CARS_TAG)
@ApiBearerAuth()
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) { }

  @UseGuards(ApiKeyAuthGuard)
  @Post('bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation(swagger.operations.bulkCreate)
  @ApiResponse({ status: 202, description: 'Bulk create job accepted for processing' })
  @ApiResponse(swagger.errors.validationError)
  @ApiResponse(swagger.errors.unauthorized)
  async bulkCreate(@Body() cars: IngestionCarDto[]): Promise<void> {
    return this.carsService.bulkCreate(cars);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation(swagger.operations.create)
  @ApiResponse(swagger.responses.create)
  @ApiResponse(swagger.errors.validationError)
  @ApiResponse(swagger.errors.unauthorized)
  create(@Body() createCarDto: CreateCarDto): Promise<Car> {
    return this.carsService.create(createCarDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation(swagger.operations.getAll)
  @ApiResponse(swagger.responses.getAll)
  @ApiResponse(swagger.errors.unauthorized)
  findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation(swagger.operations.getOne)
  @ApiResponse(swagger.responses.getOne)
  @ApiResponse(swagger.errors.notFound)
  @ApiResponse(swagger.errors.unauthorized)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Car | null> {
    return this.carsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation(swagger.operations.update)
  @ApiResponse(swagger.responses.update)
  @ApiResponse(swagger.errors.notFound)
  @ApiResponse(swagger.errors.validationError)
  @ApiResponse(swagger.errors.unauthorized)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarDto: UpdateCarDto,
  ): Promise<Partial<Car>> {
    return this.carsService.update(id, updateCarDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation(swagger.operations.delete)
  @ApiResponse(swagger.responses.delete)
  @ApiResponse(swagger.errors.notFound)
  @ApiResponse(swagger.errors.unauthorized)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/average-price-per-model')
  @ApiOperation(swagger.operations.averagePricePerModel)
  @ApiResponse(swagger.responses.averagePricePerModel)
  @ApiResponse(swagger.errors.unauthorized)
  getAveragePricePerModel() {
    return this.carsService.getAveragePricePerModel();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/make-percentage')
  @ApiOperation(swagger.operations.makePercentage)
  @ApiResponse(swagger.responses.makePercentage)
  @ApiResponse(swagger.errors.unauthorized)
  getMakePercentage() {
    return this.carsService.getMakePercentage();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/model-percentage')
  @ApiOperation(swagger.operations.modelPercentage)
  @ApiResponse(swagger.responses.modelPercentage)
  @ApiResponse(swagger.errors.unauthorized)
  getModelPercentage() {
    return this.carsService.getModelPercentage();
  }
}
