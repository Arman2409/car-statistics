import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { Car } from '../src/modules/cars/entities/car.entity';
import * as bcrypt from 'bcrypt';

describe('Cars (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let carRepository: Repository<Car>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    carRepository = moduleFixture.get<Repository<Car>>(
      getRepositoryToken(Car),
    );

    await app.init();

    // Create test user and get auth token
    const password = await bcrypt.hash('password123', 10);
    await userRepository.save({
      username: 'testuser',
      password,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;
  });

  beforeEach(async () => {
    await carRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/cars (POST)', () => {
    it('should create a car', async () => {
      const createCarDto = {
        normalizedMake: 'toyota',
        normalizedModel: 'corolla',
        year: 2020,
        price: 25000,
        location: 'New York',
      };

      const response = await request(app.getHttpServer())
        .post('/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCarDto)
        .expect(201);

      expect(response.body).toMatchObject(createCarDto);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/cars')
        .send({
          normalizedMake: 'toyota',
          normalizedModel: 'corolla',
          year: 2020,
          price: 25000,
          location: 'New York',
        })
        .expect(401);
    });
  });

  describe('/cars (GET)', () => {
    it('should return all cars', async () => {
      await carRepository.save([
        {
          normalizedMake: 'toyota',
          normalizedModel: 'corolla',
          year: 2020,
          price: 25000,
          location: 'New York',
        },
        {
          normalizedMake: 'bmw',
          normalizedModel: '3-series',
          year: 2021,
          price: 35000,
          location: 'Los Angeles',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('/cars/stats/average-price-per-model (GET)', () => {
    it('should return average price per model', async () => {
      await carRepository.save([
        {
          normalizedMake: 'toyota',
          normalizedModel: 'corolla',
          year: 2020,
          price: 20000,
          location: 'New York',
        },
        {
          normalizedMake: 'toyota',
          normalizedModel: 'corolla',
          year: 2021,
          price: 22000,
          location: 'Los Angeles',
        },
        {
          normalizedMake: 'bmw',
          normalizedModel: '3-series',
          year: 2021,
          price: 35000,
          location: 'Chicago',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/cars/stats/average-price-per-model')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('make');
      expect(response.body[0]).toHaveProperty('model');
      expect(response.body[0]).toHaveProperty('averagePrice');
    });
  });
});

