import { CarsService } from '@/modules/cars/services/cars.service';
import { CacheKeys } from '@/modules/cars/constants/cache';
import type { Car } from '@/modules/cars/entities/car.entity';
import type { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import type { Queue } from 'bullmq';
import type { Repository } from 'typeorm';
import type { RedisService } from '@/modules/redis/redis.service';
import type { Logger } from '@nestjs/common';

jest.mock('@/modules/cars/services/utils/validate-make-model', () => ({
  validateMakeAndModel: jest.fn().mockResolvedValue({
    normalizedMake: 'toyota',
    normalizedModel: 'corolla',
  }),
}));

describe('CarsService', () => {
  let service: CarsService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    insert: jest.fn(),
  } as unknown as Repository<Car>;

  const mockRedisClient = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
  const mockRedisService = {
    getClient: () => mockRedisClient,
  } as unknown as RedisService;
  const mockLogger = {
    warn: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;
  const mockQueue = { add: jest.fn() } as unknown as Queue;

  beforeEach(() => {
    service = new CarsService(
      mockRepo,
      mockRedisService,
      mockLogger,
      mockQueue,
    );
    jest.clearAllMocks();
  });

  it('create() should validate and save a car', async () => {
    const payload = {
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      price: 10000,
      location: 'NY',
    } as CreateCarDto;
    const persisted = {
      id: 1,
      ...payload,
      normalizedMake: 'toyota',
      normalizedModel: 'corolla',
    };

    (mockRepo.create as jest.Mock).mockReturnValue(persisted);
    (mockRepo.save as jest.Mock).mockResolvedValue(persisted);

    const res = await service.create(payload);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalledWith(persisted);
    expect(res).toEqual(persisted);
  });

  it('findAll() should return cached value when present', async () => {
    const mockCars = [{ id: 1, normalizedMake: 'toyota' } as Car];
    mockRedisClient.get.mockResolvedValue(JSON.stringify(mockCars));

    const res = await service.findAll();

    expect(res).toEqual(mockCars);
    expect(mockRedisClient.get).toHaveBeenCalledWith(CacheKeys.ALL_CARS);
    expect(mockRepo.find).not.toHaveBeenCalled();
  });

  it('findAll() should query DB and cache the result when cache miss', async () => {
    const mockCars = [{ id: 2, normalizedMake: 'honda' } as Car];
    mockRedisClient.get.mockResolvedValue(null);
    (mockRepo.find as jest.Mock).mockResolvedValue(mockCars);

    const res = await service.findAll();

    expect(mockRepo.find).toHaveBeenCalled();
    expect(mockRedisClient.set).toHaveBeenCalled();
    expect(res).toEqual(mockCars);
  });
});
