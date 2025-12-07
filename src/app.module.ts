import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from '@/app.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { CarsModule } from '@/modules/cars/cars.module';
import { THROTTLE_SETTINGS } from '@/modules/cars/constants/throttle';
import { User } from '@/modules/users/entities/user.entity';
import { Car } from '@/modules/cars/entities/car.entity';
import { configs } from '@/config';
import { RedisModule } from '@/modules/redis/redis.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: THROTTLE_SETTINGS.DEFAULT.name,
        ttl: THROTTLE_SETTINGS.DEFAULT.ttl,
        limit: THROTTLE_SETTINGS.DEFAULT.limit,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.redis_host'),
          port: configService.get<number>('redis.redis_port'),
        },
      }),
      inject: [ConfigService],
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
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CarsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
