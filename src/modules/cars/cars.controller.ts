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
import {
  CARS_TAG,
  CREATE_OPERATION,
  CREATE_RESPONSE,
  BULK_CREATE_OPERATION,
  BULK_CREATE_RESPONSE,
  GET_ALL_OPERATION,
  GET_ALL_RESPONSE,
  GET_ONE_OPERATION,
  GET_ONE_RESPONSE,
  UPDATE_OPERATION,
  UPDATE_RESPONSE,
  DELETE_OPERATION,
  DELETE_RESPONSE,
  VALIDATION_ERROR,
  UNAUTHORIZED,
  NOT_FOUND,
  AVERAGE_PRICE_PER_MODEL_OPERATION,
  AVERAGE_PRICE_PER_MODEL_RESPONSE,
  MAKE_PERCENTAGE_OPERATION,
  MAKE_PERCENTAGE_RESPONSE,
  MODEL_PERCENTAGE_OPERATION,
  MODEL_PERCENTAGE_RESPONSE,
} from '@/modules/cars/docs/cars.docs';
import { CarsService } from '@/modules/cars/cars.service';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import { BulkCreateCarDto } from '@/modules/cars/dto/bulk-create-car.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Car } from '@/modules/cars/entities/car.entity';

@ApiTags(CARS_TAG)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiOperation(CREATE_OPERATION)
  @ApiResponse(CREATE_RESPONSE)
  @ApiResponse(VALIDATION_ERROR)
  @ApiResponse(UNAUTHORIZED)
  create(@Body() createCarDto: CreateCarDto): Promise<Car> {
    return this.carsService.create(createCarDto);
  }

  @Post('bulk')
  @ApiOperation(BULK_CREATE_OPERATION)
  @ApiResponse(BULK_CREATE_RESPONSE)
  @ApiResponse(VALIDATION_ERROR)
  @ApiResponse(UNAUTHORIZED)
  bulkCreate(@Body() bulkCreateCarDto: BulkCreateCarDto): Promise<Car[]> {
    return this.carsService.bulkCreate(bulkCreateCarDto.cars);
  }

  @Get()
  @ApiOperation(GET_ALL_OPERATION)
  @ApiResponse(GET_ALL_RESPONSE)
  @ApiResponse(UNAUTHORIZED)
  findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }

  @Get(':id')
  @ApiOperation(GET_ONE_OPERATION)
  @ApiResponse(GET_ONE_RESPONSE)
  @ApiResponse(NOT_FOUND)
  @ApiResponse(UNAUTHORIZED)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Car | null> {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation(UPDATE_OPERATION)
  @ApiResponse(UPDATE_RESPONSE)
  @ApiResponse(NOT_FOUND)
  @ApiResponse(VALIDATION_ERROR)
  @ApiResponse(UNAUTHORIZED)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarDto: UpdateCarDto,
  ): Promise<Partial<Car>> {
    return this.carsService.update(id, updateCarDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation(DELETE_OPERATION)
  @ApiResponse(DELETE_RESPONSE)
  @ApiResponse(NOT_FOUND)
  @ApiResponse(UNAUTHORIZED)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carsService.remove(id);
  }

  @Get('stats/average-price-per-model')
  @ApiOperation(AVERAGE_PRICE_PER_MODEL_OPERATION)
  @ApiResponse(AVERAGE_PRICE_PER_MODEL_RESPONSE)
  @ApiResponse(UNAUTHORIZED)
  getAveragePricePerModel() {
    return this.carsService.getAveragePricePerModel();
  }

  @Get('stats/make-percentage')
  @ApiOperation(MAKE_PERCENTAGE_OPERATION)
  @ApiResponse(MAKE_PERCENTAGE_RESPONSE)
  @ApiResponse(UNAUTHORIZED)
  getMakePercentage() {
    return this.carsService.getMakePercentage();
  }

  @Get('stats/model-percentage')
  @ApiOperation(MODEL_PERCENTAGE_OPERATION)
  @ApiResponse(MODEL_PERCENTAGE_RESPONSE)
  @ApiResponse(UNAUTHORIZED)
  getModelPercentage() {
    return this.carsService.getModelPercentage();
  }
}
