// src/services/metrics-aggregation-service.ts -->

import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { MetricType } from '@/types/monitoring';
import { EventEmitter } from 'events';

interface AggregationWindow {
  size: '1m' | '5m' | '15m' | '1h' | '1d';
  interval: number;
}

interface AggregatedMetric {
  metricType: MetricType;
  windowSize: string;
  startTime: Date;
  endTime: Date;
  minValue: number;
  maxValue: number;
  avgValue: number;
  count: number;
}

class MetricsAggregationService extends EventEmitter {
  private static instance: MetricsAggregationService;
  private aggregationIntervals: Map<string, NodeJS.Timer>;
  private readonly windows: AggregationWindow[] = [
    { size: '1m', interval: 60 * 1000 },
    { size: '5m', interval: 5 * 60 * 1000 },
    { size: '15m', interval: 15 * 60 * 1000 },
    { size: '1h', interval: 60 * 60 * 1000 },
    { size: '1d', interval: 24 * 60 * 60 * 1000 }
  ];

  private constructor() {
    super();
    this.aggregationIntervals = new Map();
  }

  static getInstance(): MetricsAggregationService {
    if (!this.instance) {
      this.instance = new MetricsAggregationService();
    }
    return this.instance;
  }

  startAggregation(metricType: MetricType): void {
    this.windows.forEach(window => {
      const key = `${metricType}:${window.size}`;
      if (!this.aggregationIntervals.has(key)) {
        this.aggregateMetrics(metricType, window);
        const interval = setInterval(() => {
          this.aggregateMetrics(metricType, window);
        }, window.interval);
        this.aggregationIntervals.set(key, interval);
      }
    });
  }

  stopAggregation(metricType: MetricType): void {
    this.windows.forEach(window => {
      const key = `${metricType}:${window.size}`;
      const interval = this.aggregationIntervals.get(key);
      if (interval) {
        clearInterval(interval as ReturnType<typeof setInterval>);
        this.aggregationIntervals.delete(key);
      }
    });
  }

  private async aggregateMetrics(
    metricType: MetricType,
    window: AggregationWindow
  ): Promise<void> {
    try {
      const { data: result, error } = await supabase.rpc('aggregate_metrics', {
        p_window_size: window.size,
        p_metric_type: metricType
      });

      if (error) throw error;

      this.emit('aggregationComplete', {
        metricType,
        windowSize: window.size,
        result
      });
    } catch (error) {
      ErrorLogger.error(
        `Failed to aggregate metrics for ${metricType} - ${window.size}`,
        error as Error
      );
    }
  }

  async getAggregatedMetrics(
    metricType: MetricType,
    windowSize: string,
    from?: Date,
    to?: Date
  ): Promise<AggregatedMetric[]> {
    try {
      let query = supabase
        .from('metric_aggregations')
        .select('*')
        .eq('metric_type', metricType)
        .eq('window_size', windowSize);

      if (from) {
        query = query.gte('start_time', from.toISOString());
      }
      if (to) {
        query = query.lte('end_time', to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(row => ({
        metricType: row.metric_type,
        windowSize: row.window_size,
        startTime: new Date(row.start_time),
        endTime: new Date(row.end_time),
        minValue: row.min_value,
        maxValue: row.max_value,
        avgValue: row.avg_value,
        count: row.count
      }));
    } catch (error) {
      ErrorLogger.error('Failed to fetch aggregated metrics', error as Error);
      throw error;
    }
  }

  async cleanup(retentionDays: number = 30): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_old_aggregations', {
        p_retention_days: retentionDays
      });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to cleanup aggregated metrics', error as Error);
      throw error;
    }
  }

  async updateMetricsConfig(config: { enabledMetrics: MetricType[] }): Promise<void> {
    try {
      const { enabledMetrics } = config;

      // Save the enabled metrics to the database or a configuration table
      const { error } = await supabase
        .from('metrics_config')
        .upsert({ id: 1, enabled_metrics: enabledMetrics }, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to update metrics configuration', error as Error);
      throw error;
    }
  }

  onAggregationComplete(
    callback: (data: {
      metricType: MetricType;
      windowSize: string;
      result: any;
    }) => void
  ): () => void {
    this.on('aggregationComplete', callback);
    return () => this.off('aggregationComplete', callback);
  }
}

export const metricsAggregationService = MetricsAggregationService.getInstance(); 