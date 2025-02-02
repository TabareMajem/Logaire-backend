import { Card } from '@/components/ui/card';
import { AgentMetrics } from '@/types/agents';
import { useTheme } from 'next-themes';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface AgentMetricsChartProps {
  metrics: AgentMetrics;
  title: string;
  className?: string;
}

export function AgentMetricsChart({
  metrics,
  title,
  className
}: AgentMetricsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = metrics.timestamps.map((timestamp, i) => ({
    timestamp,
    requests: metrics.requestsPerMinute[i],
    latency: metrics.latencies[i],
    errors: metrics.errorRates[i]
  }));

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="font-medium mb-4">{title}</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="requests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="latency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="errors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#374151' : '#E5E7EB'}
              />
              <XAxis
                dataKey="timestamp"
                stroke={isDark ? '#6B7280' : '#9CA3AF'}
                fontSize={12}
              />
              <YAxis
                stroke={isDark ? '#6B7280' : '#9CA3AF'}
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.375rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#requests)"
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#latency)"
              />
              <Area
                type="monotone"
                dataKey="errors"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#errors)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
} 