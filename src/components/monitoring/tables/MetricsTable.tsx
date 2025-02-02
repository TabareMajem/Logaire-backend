import { AgentMetrics } from '@/lib/monitoring/types';

interface MetricsTableProps {
  metrics: AgentMetrics[];
}

export function MetricsTable({ metrics }: MetricsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Success Rate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requests/Min
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Response Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Error Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric, index) => (
            <tr key={`${metric.agentType}-${index}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {metric.agentType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(metric.successRate * 100).toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {metric.requestsPerMinute.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {metric.avgResponseTime}ms
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(metric.errorRate * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}