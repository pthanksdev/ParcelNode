import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateCacheService {
  private readonly logger = new Logger(RateCacheService.name);
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      lazyConnect: true,
    });
  }

  private generateKey(weightKg: number, origin: string, dest: string): string {
    return `rate_quote:${weightKg}:${origin}:${dest}`;
  }

  async getCachedQuotes(weightKg: number, origin: string, dest: string): Promise<any | null> {
    try {
      const key = this.generateKey(weightKg, origin, dest);
      const data = await this.redis.get(key);
      if (data) {
        this.logger.log(`Cache HIT for rate quote key: ${key}`);
        return JSON.parse(data);
      }
    } catch (err) {
      this.logger.warn(`Redis connection unavailable for rate caching: ${err}`);
    }
    return null;
  }

  async setCachedQuotes(weightKg: number, origin: string, dest: string, quotes: any, ttlSeconds = 900): Promise<void> {
    try {
      const key = this.generateKey(weightKg, origin, dest);
      await this.redis.setex(key, ttlSeconds, JSON.stringify(quotes));
      this.logger.log(`Cache SET for rate quote key: ${key} (TTL ${ttlSeconds}s)`);
    } catch (err) {
      this.logger.warn(`Failed setting rate cache in Redis: ${err}`);
    }
  }
}
