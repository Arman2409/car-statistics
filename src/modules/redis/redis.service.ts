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

  /**
   * Invalidate a single cache key
   * Handles errors gracefully without throwing
   */
  async invalidateKey(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.log(`Cache key invalidated: ${key}`);
    } catch (err) {
      this.logger.warn(`Failed to invalidate cache key: ${key}`, err instanceof Error ? err.message : String(err));
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
