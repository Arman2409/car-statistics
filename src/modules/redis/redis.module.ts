import { Global, Logger, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService, Logger],
  exports: [RedisService],
})
export class RedisModule {}
