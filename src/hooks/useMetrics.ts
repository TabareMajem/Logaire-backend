// src/hooks/useMetrics.ts -->

import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

export interface MetricData {
  overview: Array<{
    cpu: number;
    memory: number;
    diskSpace: number;
    timestamp: string;
  }>;
  latency: Array<{
    api: number;
    database: number;
    cache: number;
    timestamp: string;
  }>;
  detailed: Array<{
    successRate: number;
    errorRate: number;
    latency: number;
    timestamp: string;
  }>;
  resourceUsage: Array<{
    cpu: number;
    memory: number;
    disk: number;
    timestamp: string;
  }>;
  performance: Array<{
    latency: number;
    errorRate: number;
    timestamp: string;
  }>;
}

interface MetricsOptions {
  types?: Array<'system_health' | 'api_latency' | 'resource_usage'>;
  timeRange?: string;
  realtime?: boolean;
}

export function useMetrics(options: MetricsOptions = { realtime: true }) {
  const [metrics, setMetrics] = useState<MetricData>({
    overview: [],
    latency: [],
    detailed: [],
    resourceUsage: [],
    performance: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const ws = useWebSocket({ channel: 'metrics' });

  useEffect(() => {
    fetchMetrics();

    if (options.realtime) {
      ws.subscribe('metrics', handleRealtimeMetric);
    }

    return () => {
      if (options.realtime) {
        ws.unsubscribe('metrics');
      }
    };
  }, [options.realtime, options.timeRange, options.types?.join(',')]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .in('type', options.types || ['system_health'])
        .gte('timestamp', getTimeRangeDate(options.timeRange))
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setMetrics(transformMetricsData(data));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeMetric = (metric: any) => {
    setMetrics(prev => ({
      ...prev,
      [getMetricCategory(metric)]: [metric, ...prev[getMetricCategory(metric)]].slice(0, 100)
    }));
  };

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics
  };
}

function getTimeRangeDate(timeRange?: string): string {
  const now = new Date();
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  }
}

function getMetricCategory(metric: any): keyof MetricData {
  // Implementation depends on your metric data structure
  return 'overview';
}

function transformMetricsData(data: any[]): MetricData {
  // Implementation depends on your data structure
  return {
    overview: [],
    latency: [],
    detailed: [],
    resourceUsage: [],
    performance: []
  };
}