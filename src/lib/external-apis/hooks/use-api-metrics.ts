"use client";

import { useQuery } from '@tanstack/react-query';
import { MetricsCollector } from '../metrics';

export function useAPIMetrics(client: string) {
  const metricsCollector = new MetricsCollector();

  return useQuery({
    queryKey: ['api-metrics', client],
    queryFn: () => metricsCollector.getMetrics(client),
    refetchInterval: 60000 // Refresh every minute
  });
}