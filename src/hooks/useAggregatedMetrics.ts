import { metricsAggregatorService } from '@/services/metrics-aggregator-service';
import { MetricType } from '@/types/monitoring';
import { useEffect, useState } from 'react';

interface AggregatedMetric {
  current: number;
  min: number;
  max: number;
  avg: number;
  count: number;
  lastUpdate: Date;
}

export function useAggregatedMetrics(
  metricType: MetricType,
  window: '1m' | '5m' | '15m' | '1h' | '1d' = '5m'
) {
  const [metrics, setMetrics] = useState<AggregatedMetric | null>(null);

  useEffect(() => {
    metricsAggregatorService.startAggregating(metricType);

    const unsubscribe = metricsAggregatorService.subscribe(
      metricType,
      (aggregation) => {
        setMetrics(aggregation);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [metricType]);

  return {
    metrics,
    current: metrics?.current ?? 0,
    min: metrics?.min ?? 0,
    max: metrics?.max ?? 0,
    avg: metrics?.avg ?? 0,
    count: metrics?.count ?? 0,
    lastUpdate: metrics?.lastUpdate
  };
} 