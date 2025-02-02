import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface CarrierMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  successRate: number;
}

export class MetricsService {
  private readonly supabase = supabase;;

  async recordMetric(params: {
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
      ErrorLogger.error('Failed to record carrier metric', error as Error);
    }
  }

  async getMetrics(carrierId: string, timeframe: number = 3600): Promise<CarrierMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_carrier_metrics', {
          carrier_id: carrierId,
          lookback_seconds: timeframe
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

  async getMetricsHistory(
    carrierId: string,
    timeframe: number = 24 * 3600
  ): Promise<Array<CarrierMetrics & { timestamp: Date }>> {
    try {
      const { data, error } = await this.supabase
        .from('carrier_metrics')
        .select('*')
        .eq('carrier_id', carrierId)
        .gte('recorded_at', new Date(Date.now() - timeframe * 1000).toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      return data.map(record => ({
        requestCount: record.request_count,
        errorCount: record.error_count,
        averageLatency: record.average_latency,
        successRate: record.success_rate,
        timestamp: new Date(record.recorded_at)
      }));
    } catch (error) {
      ErrorLogger.error('Failed to get metrics history', error as Error);
      throw error;
    }
  }
}