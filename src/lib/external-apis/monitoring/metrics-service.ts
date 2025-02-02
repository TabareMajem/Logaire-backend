import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface APIMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  successRate: number;
  lastUpdated: Date;
}

export class MetricsService {
  private supabase = supabase;;

  async recordMetric(
    service: string,
    endpoint: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_metrics')
        .insert({
          service,
          endpoint,
          duration,
          success,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record API metric', error as Error);
    }
  }

  async getServiceMetrics(service: string): Promise<APIMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_service_metrics', { service_name: service });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get service metrics', error as Error);
      throw error;
    }
  }

  async getEndpointMetrics(
    service: string,
    endpoint: string
  ): Promise<APIMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_endpoint_metrics', {
          service_name: service,
          endpoint_name: endpoint
        });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get endpoint metrics', error as Error);
      throw error;
    }
  }
}