import { Redis, RedisOptions } from 'ioredis';
import { ErrorLogger } from '../errors/logger';

interface CacheConfig {
  defaultTTL: number; // Time to live in seconds
  maxSize: number; // Maximum number of items in cache
}

export class CacheManager {
  private redis: Redis;
  private readonly config: CacheConfig;

  constructor(redisOptions: RedisOptions, config: Partial<CacheConfig> = {}) {
    this.redis = new Redis(redisOptions);
    this.config = {
      defaultTTL: config.defaultTTL || 3600, // 1 hour default
      maxSize: config.maxSize || 10000
    };

    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.redis.on('error', (error: Error) => {
      ErrorLogger.error('Redis cache error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      ErrorLogger.error('Cache get error:', error as Error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.setex(key, this.config.defaultTTL, serializedValue);
      }
    } catch (error) {
      ErrorLogger.error('Cache set error:', error as Error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      ErrorLogger.error('Cache delete error:', error as Error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return await this.redis.exists(key) === 1;
    } catch (error) {
      ErrorLogger.error('Cache check error:', error as Error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      ErrorLogger.error('Cache clear error:', error as Error);
    }
  }

  async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(keys);
      return values.map(v => v ? JSON.parse(v) : null);
    } catch (error) {
      ErrorLogger.error('Cache multiple get error:', error as Error);
      return keys.map(() => null);
    }
  }

  async setMultiple(entries: { key: string; value: any; ttl?: number }[]): Promise<void> {
    try {
      const multi = this.redis.multi();
      entries.forEach(({ key, value, ttl }) => {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          multi.setex(key, ttl, serializedValue);
        } else {
          multi.setex(key, this.config.defaultTTL, serializedValue);
        }
      });
      await multi.exec();
    } catch (error) {
      ErrorLogger.error('Cache multiple set error:', error as Error);
    }
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}

// Create and export singleton instance
export const cacheManager = new CacheManager({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
}); 