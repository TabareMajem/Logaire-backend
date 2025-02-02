"use client";

import { useQuery } from '@tanstack/react-query';
import { MetricsCollector } from '../metrics';
import { ErrorLogger } from '@/lib/errors/logger';

interface MetricsChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
}

export function useAPIMetricsChart(client: string, timeframe: string = '24h') {
  const metricsCollector = new MetricsCollector();

  return useQuery({
    queryKey: ['api-metrics-chart', client, timeframe],
    queryFn: async () => {
      try {
        const metrics = await metricsCollector.getMetrics(client);
        
        return {
          labels: generateTimeLabels(timeframe),
          datasets: [
            {
              label: 'Success Rate',
              data: [metrics.successRate]
            },
            {
              label: 'Average Latency',
              data: [metrics.averageLatency]
            }
          ]
        } as MetricsChartData;
      } catch (error) {
        ErrorLogger.error('Failed to fetch metrics chart data', error as Error);
        throw error;
      }
    },
    refetchInterval: 60000 // Refresh every minute
  });
}

function generateTimeLabels(timeframe: string): string[] {
  // Implementation
  return [];
}