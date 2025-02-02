import { requestCache } from '@/lib/cache/request-cache';
import { supabase } from '@/lib/supabase/client';
import { MetricData } from '@/types/monitoring';

export class MetricsService {
  private static instance: MetricsService;

  private constructor() {}

  static getInstance(): MetricsService {
    if (!this.instance) {
      this.instance = new MetricsService();
    }
    return this.instance;
  }

  async getMetrics(type: string, timeRange: string): Promise<MetricData[]> {
    const cacheKey = `metrics:${type}:${timeRange}`;
    const cached = await requestCache.get<MetricData[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('type', type)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    requestCache.set(cacheKey, data);
    return data;
  }

  async insertMetrics(metrics: MetricData[]): Promise<void> {
    const { error } = await supabase
      .from('metrics')
      .insert(metrics);

    if (error) throw error;
  }
}

export const metricsService = MetricsService.getInstance(); 