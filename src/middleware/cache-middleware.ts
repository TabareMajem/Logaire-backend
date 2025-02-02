import { enhancedCache } from '@/lib/cache/enhanced-cache-manager';
import { NextApiRequest, NextApiResponse } from 'next';

interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: NextApiRequest) => string;
  condition?: (req: NextApiRequest) => boolean;
}

export function withCache(options: CacheOptions = {}) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) => {
    if (req.method !== 'GET' || (options.condition && !options.condition(req))) {
      return next();
    }

    const cacheKey = options.keyGenerator 
      ? options.keyGenerator(req)
      : `${req.url}`;

    try {
      const cachedData = await enhancedCache.get(cacheKey);
      
      if (cachedData) {
        return res.status(200).json({
          data: cachedData,
          cached: true
        });
      }

      // Store original res.json to intercept the response
      const originalJson = res.json;
      res.json = function(data: any) {
        enhancedCache.set(cacheKey, data, {
          ttl: options.ttl,
          priority: 'high'
        });
        return originalJson.call(this, {
          data,
          cached: false
        });
      };

      return next();
    } catch (error) {
      ErrorLogger.error('Cache middleware error:', error as Error);
      return next();
    }
  };
} 