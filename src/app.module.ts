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
import { RedisService } from '@/services/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, () => require('./config/external.config').default()],
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
    AuthModule,
    UsersModule,
    CarsModule,
  ],
  controllers: [AppController],
  providers: [RedisService],
})
export class AppModule {}

