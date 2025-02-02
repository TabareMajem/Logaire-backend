import { Card } from '@/components/ui/card';
import { useMetrics } from '@/hooks/useMetrics';
import { useTheme } from 'next-themes';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function MetricsOverview() {
  const { metrics, isLoading } = useMetrics();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="font-medium mb-4">System Metrics</h3>
        <div className="h-[300px] animate-pulse bg-gray-200 rounded" />
      </Card>
    );
  }

  // Process metrics data for visualization
  const chartData = metrics.map(m => ({
    timestamp: new Date(m.timestamp).toLocaleTimeString(),
    cpu: m.cpu,
    memory: m.memory,
    disk: m.disk
  }));

  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">System Metrics</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="memory" 
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="disk" 
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 