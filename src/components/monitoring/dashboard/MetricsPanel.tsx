// src/components/monitoring/dashboard/MetricPanel.tsx -->

import { AgentMetrics, SystemMetrics } from '@/lib/monitoring/types';
import { formatNumber } from '@/lib/utils/format';
import { MetricCard } from './MetricCard';

interface MetricsPanelProps {
  metrics: {
    agent: AgentMetrics[];
    system: SystemMetrics;
  };
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  const aggregateAgentMetrics = (metrics: AgentMetrics[]) => {
    return metrics.reduce(
      (acc, curr) => ({
        successRate: acc.successRate + curr.successRate / metrics.length,
        requestsPerMinute: acc.requestsPerMinute + curr.requestsPerMinute,
        costPerRequest: acc.costPerRequest + curr.costPerRequest / metrics.length,
        errorRate: acc.errorRate + curr.errorRate / metrics.length
      }),
      { successRate: 0, requestsPerMinute: 0, costPerRequest: 0, errorRate: 0 }
    );
  };

  const agentStats = aggregateAgentMetrics(metrics.agent);

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="Success Rate"
        value={`${formatNumber(agentStats.successRate * 100)}%`}
        trend="up"
        delta={2.5}
      />
      <MetricCard
        title="Requests/min"
        value={formatNumber(agentStats.requestsPerMinute)}
        trend="stable"
        delta={0}
      />
      <MetricCard
        title="CPU Usage"
        value={`${formatNumber(metrics.system.cpuUsage * 100)}%`}
        trend={metrics.system.cpuUsage > 0.8 ? 'down' : 'up'}
        delta={metrics.system.cpuUsage * 100}
      />
      <MetricCard
        title="Memory Usage"
        value={`${formatNumber(metrics.system.memoryUsage * 100)}%`}
        trend={metrics.system.memoryUsage > 0.8 ? 'down' : 'up'}
        delta={metrics.system.memoryUsage * 100}
      />
    </div>
  );
} 