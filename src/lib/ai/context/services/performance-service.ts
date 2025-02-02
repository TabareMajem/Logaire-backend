// src/lib/ai/context/services/performance-service.ts

import { supabase } from '@/lib/supabase/client';
import { PerformanceMetrics } from '../../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class PerformanceService {
  private readonly supabase =supabase;

  async getHistoricalPerformance(companyId: string): Promise<PerformanceMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_company_performance_metrics', {
          company_id: companyId,
          lookback_days: 30
        });

      if (error) throw error;

      return {
        successRate: data.success_rate,
        averageLatency: data.average_latency,
        errorRate: data.error_rate,
        throughput: data.throughput,
        lastUpdated: new Date()
      };
    } catch (error) {
      ErrorLogger.error('Failed to fetch performance metrics', error as Error);
      throw error;
    }
  }
}