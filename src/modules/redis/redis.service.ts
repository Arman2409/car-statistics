// src/redis/redis.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private connected: boolean = false;

  constructor(private readonly logger: Logger) {
    if(this.client                           ) {
      this.logger.warn('🔌 Redis client already initialized');
    }

    this.client = new Redis({
      host: process.env.CACHE_HOST || 'localhost',
      port: Number(process.env.CACHE_PORT) || 6379,
      db: Number(process.env.CACHE_DB) || 0,
    });

    this.client.on('connect', () => {
      this.logger.log('🔌 Redis connected');
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ Redis error: ${err.message}`);
    });

  }

  /** Return underlying Redis client (singleton instance) */
  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
