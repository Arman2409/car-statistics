import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarsService } from '@/modules/cars/services/cars.service';
import { CreateCarDto } from '@/modules/cars/dto/create-car.dto';
import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import type { Car } from '@/modules/cars/entities/car.entity';

describe('CarsService', () => {
  let service: CarsService;
  let repository: Repository<Car>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        {
          provide: getRepositoryToken(Car),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
    repository = module.get<Repository<Car>>(getRepositoryToken(Car));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a car', async () => {
      const createCarDto: CreateCarDto = {
        normalizedMake: 'toyota',
        normalizedModel: 'corolla',
        year: 2020,
        price: 25000,
        location: 'New York',
      };
      const mockCar = { id: 1, ...createCarDto };

      mockRepository.create.mockReturnValue(mockCar);
      mockRepository.save.mockResolvedValue(mockCar);

      const result = await service.create(createCarDto);

      expect(result).toEqual(mockCar);
      expect(mockRepository.create).toHaveBeenCalledWith(createCarDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCar);
    });
  });

  describe('findAll', () => {
    it('should return an array of cars', async () => {
      const mockCars = [
        {
          id: 1,
          normalizedMake: 'toyota',
          normalizedModel: 'corolla',
          year: 2020,
          price: 25000,
          location: 'New York',
        },
      ];

      mockRepository.find.mockResolvedValue(mockCars);

      const result = await service.findAll();

      expect(result).toEqual(mockCars);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a car by id', async () => {
      const mockCar = {
        id: 1,
        normalizedMake: 'toyota',
        normalizedModel: 'corolla',
        year: 2020,
        price: 25000,
        location: 'New York',
      };

      mockRepository.findOne.mockResolvedValue(mockCar);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCar);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
