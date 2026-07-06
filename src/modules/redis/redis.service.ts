// src/redis/redis.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.client = new Redis({
      host: this.configService.get<string>('redis.redis_host'),
      port: this.configService.get<number>('redis.redis_port'),
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
      this.logger.warn(
        `Failed to invalidate cache key: ${key}`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
