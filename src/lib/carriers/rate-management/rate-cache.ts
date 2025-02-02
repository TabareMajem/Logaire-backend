done done

import { supabase } from '@/lib/supabase/client';
import { RateRequest, Rate } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class RateCache {
  private readonly ttl = 3600; // 1 hour
  private readonly supabase = supabase;;

  async getRates(request: RateRequest): Promise<Rate[] | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      
      const { data, error } = await this.supabase
        .from('rate_cache')
        .select('rates, created_at')
        .eq('cache_key', cacheKey)
        .single();

      if (error) throw error;

      if (!data || this.isExpired(data.created_at)) {
        return null;
      }

      return data.rates as Rate[];
    } catch (error) {
      ErrorLogger.error('Failed to get rates from cache', error as Error);
      return null;
    }
  }

  async setRates(request: RateRequest, rates: Rate[]): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);
      
      const { error } = await this.supabase
        .from('rate_cache')
        .upsert({
          cache_key: cacheKey,
          rates,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to cache rates', error as Error);
    }
  }

  async invalidate(request: RateRequest): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);
      
      const { error } = await this.supabase
        .from('rate_cache')
        .delete()
        .eq('cache_key', cacheKey);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to invalidate cache', error as Error);
    }
  }

  private generateCacheKey(request: RateRequest): string {
    return `rates:${JSON.stringify({
      origin: request.origin.code,
      destination: request.destination.code,
      cargoType: request.cargoDetails.type,
      weight: request.cargoDetails.weight,
      equipmentType: request.equipmentType
    })}`;
  }

  private isExpired(createdAt: string): boolean {
    const age = Date.now() - new Date(createdAt).getTime();
    return age > this.ttl * 1000;
  }
}