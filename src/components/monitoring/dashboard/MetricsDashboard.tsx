// src/components/monitoring/dashboard/MetricsDashboard.tsx -->

import { useAuth } from '@/hooks/useAuth';
import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import { AgentMetrics, SystemMetrics } from '@/lib/monitoring/types';
import { useEffect, useState } from 'react';
import { AlertsList } from '@/components/api-monitoring/alerts-list';
import { MetricsPanel } from './MetricsPanel';
import { PerformanceGraph } from './PerformanceGraph';
import { TimeRangeSelector } from './TimeRangeSelector';

export function MetricsDashboard() {
  const { session } = useAuth();
  const socket = useMonitoringSocket();
  const [metrics, setMetrics] = useState<{
    agent: AgentMetrics[];
    system: SystemMetrics;
  }>();
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    if (!session) return;

    // Initial data load
    fetchMetrics();

    // Subscribe to real-time updates
    socket.subscribe(['metrics', 'alerts'], handleUpdate);

    return () => {
      socket.unsubscribe(['metrics', 'alerts']);
    };
  }, [session, timeRange]);

  const fetchMetrics = async () => {
    const response = await fetch(`/api/monitoring/metrics?range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });
    const data = await response.json();
    setMetrics(data);
  };

  const handleUpdate = (data: any) => {
    setMetrics(prev => ({
      ...prev,
      ...data
    }));
  };

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Monitoring</h1>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <MetricsPanel metrics={metrics} />
          <div className="mt-4">
            <PerformanceGraph data={metrics.agent} timeRange={timeRange} />
          </div>
        </div>
        <div className="col-span-4">
          <AlertsList />
        </div>
      </div>
    </div>
  );
} 