// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.CACHE_HOST || 'localhost',
      port: Number(process.env.CACHE_PORT) || 6379,
      db: Number(process.env.CACHE_DB) || 0,
    });

    this.client.on('connect', () => {
      console.log('🔌 Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
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
