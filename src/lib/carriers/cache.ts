import { supabase } from '@/lib/supabase/client';
import { RateRequest, Rate } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export class RateCache {
  private readonly supabase = supabase;;
  private readonly TTL = 3600; // 1 hour

  async getRates(request: RateRequest): Promise<Rate[] | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      
      const { data, error } = await this.supabase
        .from('rate_cache')
        .select('rates, created_at')
        .eq('cache_key', cacheKey)
        .single();

      if (error) return null;

      if (this.isExpired(data.created_at)) {
        await this.invalidate(cacheKey);
        return null;
      }

      return data.rates;
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

  private generateCacheKey(request: RateRequest): string {
    return `rates:${JSON.stringify({
      origin: request.origin.code,
      destination: request.destination.code,
      cargoType: request.cargoDetails.containerType,
      weight: request.cargoDetails.weight,
      departureDate: request.departureDate?.toISOString().split('T')[0]
    })}`;
  }

  private isExpired(timestamp: string): boolean {
    const age = Date.now() - new Date(timestamp).getTime();
    return age > this.TTL * 1000;
  }

  private async invalidate(cacheKey: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('rate_cache')
        .delete()
        .eq('cache_key', cacheKey);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to invalidate cache', error as Error);
    }
  }
}