// src/components/monitoring/real-time/RealTimeMetrics.tsx -->

import { useToast } from '@/hooks/useToast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Metric, MetricType } from '@/types/monitoring';
import { useEffect, useState } from 'react';
import { ConnectionStatus } from '../status/ConnectionStatus';
import { AdvancedMetricsChart } from '../visualization/AdvancedMetricsChart';

interface RealTimeMetricsProps {
  metricType: string;
  title: string;
  className?: string;
}

export function RealTimeMetrics({ metricType, title, className }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const { isConnected, error, subscribe } = useWebSocket({
    onConnected: () => {
      showToast({
        type: 'success',
        message: 'Connected to real-time metrics'
      });
    }
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe<Metric>(`metrics:${metricType}`, (newMetric) => {
      setMetrics(prev => {
        // Keep last 100 data points for performance
        const updated = [...prev, newMetric].slice(-100);
        return updated;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, metricType]);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <ConnectionStatus />
      </div>

      {error ? (
        <div className="text-center p-4 text-red-500">
          Failed to connect to metrics service
        </div>
      ) : (
        
        <AdvancedMetricsChart
          metrics={metrics.map((metric) => metric.type as MetricType)}
          title={title}
          className="h-[400px]"
        />
      )}
    </div>
  );
} 