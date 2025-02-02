import { enhancedCache } from '@/lib/cache/enhanced-cache-manager';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from './useToast';
import { ErrorLogger } from '@/lib/errors/logger';

interface UseCacheOptions<T> {
  key: string;
  ttl?: number;
  initialData?: T;
  onError?: (error: Error) => void;
}

export function useCache<T>({
  key,
  ttl,
  initialData,
  onError
}: UseCacheOptions<T>) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadFromCache();
  }, [key]);

  const loadFromCache = async () => {
    try {
      setIsLoading(true);
      const cachedData = await enhancedCache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
      }
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCache = useCallback(async (newData: T) => {
    try {
      await enhancedCache.set(key, newData, { ttl });
      setData(newData);
    } catch (error) {
      handleError(error as Error);
    }
  }, [key, ttl]);

  const invalidateCache = useCallback(async () => {
    try {
      enhancedCache.delete(key);
      setData(null);
    } catch (error) {
      handleError(error as Error);
    }
  }, [key]);

  const handleError = (error: Error) => {
    ErrorLogger.error('Cache operation failed:', error);
    showToast({
      type: 'error',
      message: 'Failed to access cache'
    });
    if (onError) {
      onError(error);
    }
  };

  return {
    data,
    isLoading,
    updateCache,
    invalidateCache
  };
} 