import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '@/app.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { CarsModule } from '@/modules/cars/cars.module';
import databaseConfig from '@/config/database.config';
import { User } from '@/modules/users/entities/user.entity';
import { Car } from '@/modules/cars/entities/car.entity';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [User, Car],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const url = process.env.REDIS_URL;
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT as string, 10) || 6379;
        const password = process.env.REDIS_PASSWORD;

        // cache-manager expects TTL in seconds
        const ttlSeconds = 90 * 24 * 60 * 60; // 90 days in seconds

        return {
          store: redisStore,
          ...(url
            ? { url }
            : {
                host,
                port,
                password,
              }),
          ttl: ttlSeconds,
        };
      },
    }),
    AuthModule,
    UsersModule,
    CarsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

