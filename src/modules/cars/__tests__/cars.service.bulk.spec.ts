import { CarsService } from '@/modules/cars/services/cars.service';
import { Logger } from '@nestjs/common';
import { BULK_SETTINGS } from '@/modules/cars/constants/limits';
import type { Car } from '@/modules/cars/entities/car.entity';

describe('CarsService bulkCreate', () => {
  let service: CarsService;
  const mockRepo = {} as any;
  const mockRedis = {} as any;
  const mockLogger = new Logger();

  it('enqueues single job when payload <= JOB_CHUNK_SIZE', async () => {
    const mockQueue = { add: jest.fn().mockResolvedValue(undefined) } as any;
    service = new CarsService(mockRepo, mockRedis, mockLogger, mockQueue);

    const payload: Partial<Car>[] = Array.from({ length: BULK_SETTINGS.JOB_CHUNK_SIZE }).map(() => ({ normalizedMake: 'x' } as Partial<Car>));

    await service.bulkCreate(payload);

    expect(mockQueue.add).toHaveBeenCalledTimes(1);
    expect(mockQueue.add).toHaveBeenCalledWith('process-bulk', payload, expect.any(Object));
  });

  it('enqueues multiple jobs when payload > JOB_CHUNK_SIZE', async () => {
    const mockQueue = { add: jest.fn().mockResolvedValue(undefined) } as any;
    service = new CarsService(mockRepo, mockRedis, mockLogger, mockQueue);

    const total = BULK_SETTINGS.JOB_CHUNK_SIZE * 2 + 10;
    const payload: Partial<Car>[] = Array.from({ length: total }).map(() => ({ normalizedMake: 'x' } as Partial<Car>));

    await service.bulkCreate(payload);

    const expectedCalls = Math.ceil(total / BULK_SETTINGS.JOB_CHUNK_SIZE);
    expect(mockQueue.add).toHaveBeenCalledTimes(expectedCalls);
  });
});
