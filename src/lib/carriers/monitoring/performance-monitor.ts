import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  successRate: number;
}

export class PerformanceMonitor {
  private readonly supabase = supabase;;

  async recordMetrics(params: {
    carrierId: string;
    operation: string;
    duration: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('carrier_metrics')
        .insert({
          carrier_id: params.carrierId,
          operation: params.operation,
          duration: params.duration,
          success: params.success,
          error_message: params.error,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record carrier metrics', error as Error);
    }
  }

  async getMetrics(carrierId: string): Promise<PerformanceMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_carrier_metrics', {
          carrier_id: carrierId,
          lookback_minutes: 60
        });

      if (error) throw error;

      return {
        requestCount: data.request_count,
        errorCount: data.error_count,
        averageLatency: data.average_latency,
        successRate: data.success_rate
      };
    } catch (error) {
      ErrorLogger.error('Failed to get carrier metrics', error as Error);
      throw error;
    }
  }
}