import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class Cache {
  private supabase = supabase;;
  private defaultTTL = 5 * 60; // 5 minutes

  async get(key: string): Promise<unknown | null> {
    try {
      const { data, error } = await this.supabase
        .from('api_cache')
        .select('value, expires_at')
        .eq('key', key)
        .single();

      if (error) throw error;

      if (data && new Date(data.expires_at) > new Date()) {
        return JSON.parse(data.value);
      }

      return null;
    } catch (error) {
      ErrorLogger.error('Cache get failed', error as Error);
      return null;
    }
  }

  async set(
    key: string,
    value: unknown,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttl * 1000);
      
      const { error } = await this.supabase
        .from('api_cache')
        .upsert({
          key,
          value: JSON.stringify(value),
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Cache set failed', error as Error);
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_cache')
        .delete()
        .eq('key', key);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Cache invalidation failed', error as Error);
    }
  }
}