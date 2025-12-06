import { Test } from '@nestjs/testing';
import { CarsController } from '@/modules/cars/cars.controller';
import { CarsService } from '@/modules/cars/services/cars.service';
import type { IngestionCarDto } from '@/modules/cars/dto/ingestion-car.dto';
import { ConfigModule } from '@nestjs/config';

describe('CarsController', () => {
  let controller: CarsController;
  const mockCarsService = {
    bulkCreate: jest.fn(),
    getAveragePricePerModel: jest.fn(),
    getMakePercentage: jest.fn(),
    getModelPercentage: jest.fn(),
  } as unknown as Partial<CarsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CarsController],
      imports: [ConfigModule.forRoot()],
      providers: [{ provide: CarsService, useValue: mockCarsService }],
    }).compile();

    controller = module.get<CarsController>(CarsController);
  });

  it('should enqueue bulk create (controller)', async () => {
    const payload: IngestionCarDto[] = [
      { normalizedMake: 'toyota', normalizedModel: 'corolla', year: 2020, price: 10000, location: 'NY' },
    ] as unknown as IngestionCarDto[];

    await controller.bulkCreate(payload);

    expect(mockCarsService.bulkCreate).toHaveBeenCalledWith(payload);
  });

  it('should return average price per model', async () => {
    const sample = [{ make: 'toyota', model: 'corolla', averagePrice: 12000 }];
    (mockCarsService.getAveragePricePerModel as jest.Mock).mockResolvedValue(sample);

    const res = await controller.getAveragePricePerModel();
    expect(res).toEqual(sample);
  });
});
