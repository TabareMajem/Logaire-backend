// src/hooks/useRealtimeMetrics.ts -->

import { MetricData } from '@/lib/monitoring/agents/base/monitoring-agent';
import { MetricType } from '@/lib/monitoring/metrics/metrics-collector';
import { metricsWebSocket } from '@/lib/websocket/metrics-websocket';
import { useEffect, useState } from 'react';

interface UseRealtimeMetricsOptions {
  types: MetricType[];
  interval?: number;
}

export function useRealtimeMetrics({ types, interval = 1000 }: UseRealtimeMetricsOptions) {
  const [metrics, setMetrics] = useState<Record<MetricType, any[]>>({} as any);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // const handleMetrics = (data: any) => {
    //   setMetrics(prev => ({
    //     ...prev,
    //     [data.type]: [...(prev[data.type] || []), data]
    //   }));
    // };

    const handleMetrics = (data: MetricData) => {
      setMetrics(prev => ({
        ...prev,
        // [data.type]: [...(prev[data.type] || []), data]
      }));
    };

    const handleConnection = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnection = () => {
      setIsConnected(false);
    };

    const handleError = (err: Error) => {
      setError(err);
      setIsConnected(false);
    };

    metricsWebSocket.on('metrics', handleMetrics);
    metricsWebSocket.on('connected', handleConnection);
    metricsWebSocket.on('disconnected', handleDisconnection);
    metricsWebSocket.on('error', handleError);

    // Subscribe to specified metric types
    types.forEach(type => {
      metricsWebSocket.sendMessage({
        type: 'metrics',
        payload: { metric: type }
      });
    });

    return () => {
      metricsWebSocket.off('metrics', handleMetrics);
      metricsWebSocket.off('connected', handleConnection);
      metricsWebSocket.off('disconnected', handleDisconnection);
      metricsWebSocket.off('error', handleError);
    };
  }, [types]);

  return {
    metrics,
    isConnected,
    error
  };
} 