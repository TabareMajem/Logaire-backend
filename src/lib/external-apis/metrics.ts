import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface APIMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  p95Latency: number;
  successRate: number;
}

export class MetricsCollector {
  private supabase = supabase;;

  async recordMetrics(
    client: string,
    endpoint: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_metrics')
        .insert({
          client,
          endpoint,
          duration,
          success,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record API metrics', error as Error);
    }
  }

  async getMetrics(client: string): Promise<APIMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_api_metrics', { client_name: client });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get API metrics', error as Error);
      throw error;
    }
  }
}