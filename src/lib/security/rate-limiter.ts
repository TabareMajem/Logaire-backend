import { Redis } from 'ioredis';
import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorLogger } from '../errors/logger';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: NextApiRequest) => string;
}

export class RateLimiter {
  private redis: Redis;
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  };

  constructor(redisUrl: string, private config: RateLimitConfig = {}) {
    this.redis = new Redis(redisUrl);
    this.config = { ...this.defaultConfig, ...config };
  }

  middleware = async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      const key = this.getKey(req);
      const current = await this.increment(key);

      res.setHeader('X-RateLimit-Limit', this.config.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.max - current));

      if (current > this.config.max) {
        return res.status(429).json({
          error: 'Too many requests, please try again later.'
        });
      }

      next();
    } catch (error) {
      ErrorLogger.error('Rate limiter error:', error as Error);
      // Allow request to proceed on rate limiter error
      next();
    }
  };

  private getKey(req: NextApiRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }
    return `rate-limit:${req.ip}`;
  }

  private async increment(key: string): Promise<number> {
    const multi = this.redis.multi();
    multi.incr(key);
    multi.pexpire(key, this.config.windowMs);
    const results = await multi.exec();
    return results ? (results[0][1] as number) : 0;
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }
} 