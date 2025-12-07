import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from '@/modules/cars/cars.controller';
import { CarsService } from '@/modules/cars/services/cars.service';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import { ApiKeyAuthGuard } from '@/modules/cars/guards/api-key-auth.guard';
import { JwtAuthGuard } from '@/modules/cars/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { IngestionCarDto } from '@/modules/cars/dto/ingestion-car.dto';
import type { UpdateCarDto } from '@/modules/cars/dto/update-car.dto';
import { mockCar, createMockCarsService, createMockGuards, createMockConfigService } from '@/modules/cars/__mocks__/cars.mocks';

describe('CarsController', () => {
  let controller: CarsController;
  let mockService: ReturnType<typeof createMockCarsService>;
  let mockGuards: ReturnType<typeof createMockGuards>;
  let mockConfigService: ReturnType<typeof createMockConfigService>;

  beforeEach(async () => {
    mockService = createMockCarsService();
    mockGuards = createMockGuards();
    mockConfigService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [
        {
          provide: CarsService,
          useValue: mockService,
        },
        {
          provide: ApiKeyAuthGuard,
          useValue: mockGuards.ApiKeyAuthGuard,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockGuards.JwtAuthGuard,
        },
        {
            provide: ConfigService,
            useValue: mockConfigService,
        }
      ],
    }).compile();

    controller = module.get<CarsController>(CarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('bulkCreate() should call service', async () => {
    const payload = [{ normalizedMake: 'toyota' } as IngestionCarDto];

    await controller.bulkCreate(payload);
    expect(mockService.bulkCreate).toHaveBeenCalledWith(payload);
  });

  it('create() should create a car', async () => {
    const dto: CreateCarDto = { make: 'Toyota', model: 'Corolla', year: 2020, price: 10000, location: 'NY' };

    const res = await controller.create(dto);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual(mockCar);
  });

  it('findAll() should return list', async () => {
    const res = await controller.findAll();

    expect(mockService.findAll).toHaveBeenCalled();
    expect(res).toEqual([mockCar]);
  });

  it('findOne() should return a car', async () => {
    const res = await controller.findOne(1);

    expect(mockService.findOne).toHaveBeenCalledWith(1);
    expect(res).toEqual(mockCar);
  });

  it('update() should call service and return partial', async () => {
    const res = await controller.update(1, { price: 12000 } as UpdateCarDto);

    expect(mockService.update).toHaveBeenCalledWith(1, { price: 12000 });
    expect(res).toEqual({ price: 12000 });
  });

  it('remove() should call service', async () => {
    await controller.remove(1);

    expect(mockService.remove).toHaveBeenCalledWith(1);
  });

  it('stats endpoints should call service', async () => {
    const avg = await controller.getAveragePricePerModel();

    expect(mockService.getAveragePricePerModel).toHaveBeenCalled();
    expect(avg).toEqual([{ make: 'toyota', model: 'corolla', averagePrice: 10000 }]);

    const makePct = await controller.getMakePercentage();

    expect(mockService.getMakePercentage).toHaveBeenCalled();
    expect(makePct).toEqual([{ make: 'toyota', percentage: 100 }]);

    const modelPct = await controller.getModelPercentage();

    expect(mockService.getModelPercentage).toHaveBeenCalled();
    expect(modelPct).toEqual([{ model: 'corolla', percentage: 100 }]);
  });
});
