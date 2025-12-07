import { Test } from '@nestjs/testing';
import { MakeAndModelSeederService } from '@/modules/cars/services/make-and-model-seeder.service';
import { RedisService } from '@/modules/redis/redis.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('MakeSeederService', () => {
  let service: MakeAndModelSeederService;
  const mockRedisClient = { get: jest.fn() };
  const mockRedisService = { getClient: () => mockRedisClient };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MakeAndModelSeederService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: HttpService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    service = module.get<MakeAndModelSeederService>(MakeAndModelSeederService);
  });

  it('should not fetch when cache present', async () => {
    mockRedisClient.get.mockResolvedValue('cached');

    await service.seedMakesAndModelsIfEmpty();

    expect(mockRedisClient.get).toHaveBeenCalled();
  });
});
