import type { Car } from '@/modules/cars/entities/car.entity';
import type { BulkCreateCarItemDto } from '@/modules/cars/dto/bulk-create-car.dto';

export const mockCar: Car = {
  id: 1,
  normalizedMake: 'toyota',
  normalizedModel: 'corolla',
  year: 2020,
  price: 10000,
  location: 'NY',
  createdAt: new Date(),
  updatedAt: new Date(),
} as Car;

export const mockBulkCreateCarItem: BulkCreateCarItemDto = {
  normalizedMake: 'toyota',
  normalizedModel: 'corolla',
  year: 2020,
  price: 10000,
  location: 'NY',
};

export const createMockCarsService = () => ({
  bulkCreate: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue(mockCar),
  findAll: jest.fn().mockResolvedValue([mockCar]),
  findOne: jest.fn().mockResolvedValue(mockCar),
  update: jest.fn().mockResolvedValue({ price: 12000 }),
  remove: jest.fn().mockResolvedValue(undefined),
  getAveragePricePerModel: jest
    .fn()
    .mockResolvedValue([
      { make: 'toyota', model: 'corolla', averagePrice: 10000 },
    ]),
  getMakePercentage: jest
    .fn()
    .mockResolvedValue([{ make: 'toyota', percentage: 100 }]),
  getModelPercentage: jest
    .fn()
    .mockResolvedValue([{ model: 'corolla', percentage: 100 }]),
});

export const createMockGuards = () => ({
  ApiKeyAuthGuard: { canActivate: jest.fn().mockReturnValue(true) },
  JwtAuthGuard: { canActivate: jest.fn().mockReturnValue(true) },
});

export const createMockConfigService = () => ({
  get: jest.fn().mockReturnValue('someValue'),
});
