// src/components/monitoring/dashboard/AgentMetricsPanel.tsx -->

import { AgentMetrics } from '@/lib/monitoring/types';
import { LineChart } from '../charts/LineChart';
import { MetricsTable } from '../tables/MetricsTable';

interface AgentMetricsPanelProps {
  metrics: AgentMetrics[];
}

export function AgentMetricsPanel({ metrics }: AgentMetricsPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Agent Performance</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map(metric => (
          <div key={metric.agentType} className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">{metric.agentType}</h3>
            <div className="text-2xl font-bold">
              {(metric.successRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <LineChart
          data={metrics}
          xAxis="timestamp"
          yAxis="requestsPerMinute"
          title="Requests per Minute"
        />
      </div>

      <MetricsTable metrics={metrics} />
    </div>
  );
} 