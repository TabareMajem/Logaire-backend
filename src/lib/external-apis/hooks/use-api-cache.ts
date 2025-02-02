"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Cache } from '../cache';
import { ErrorLogger } from '@/lib/errors/logger';

export function useAPICache() {
  const cache = new Cache();
  const queryClient = useQueryClient();

  const invalidateCache = async (key: string) => {
    try {
      await cache.invalidate(key);
      await queryClient.invalidateQueries({queryKey: [key]});
    } catch (error) {
      ErrorLogger.error('Failed to invalidate cache', error as Error);
    }
  };

  const clearCache = async () => {
    try {
      // Clear all API-related cache entries
      const keys = await queryClient.getQueryCache().findAll();
      await Promise.all(
        keys.map(query => cache.invalidate(query.queryKey.join(':')))
      );
      await queryClient.resetQueries();
    } catch (error) {
      ErrorLogger.error('Failed to clear cache', error as Error);
    }
  };

  return {
    invalidateCache,
    clearCache
  };
}