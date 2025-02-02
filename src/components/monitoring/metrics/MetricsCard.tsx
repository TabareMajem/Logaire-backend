import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MetricType } from '@/types/monitoring';
import { useTheme } from 'next-themes';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MetricsCardProps {
  title: string;
  value: number;
  type: MetricType;
  data?: Array<{ timestamp: string; value: number }>;
  change?: number;
  isLoading?: boolean;
  className?: string;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

export function MetricsCard({
  title,
  value,
  type,
  data,
  change,
  isLoading,
  className,
  thresholds
}: MetricsCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getStatusColor = (value: number) => {
    if (!thresholds) return 'text-gray-900 dark:text-gray-100';
    if (value >= (thresholds.critical || Infinity)) return 'text-red-600 dark:text-red-400';
    if (value >= (thresholds.warning || Infinity)) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatValue = (val: number) => {
    switch (type) {
      case 'cpu':
      case 'memory':
        return `${val.toFixed(1)}%`;
      case 'disk':
        return `${val.toFixed(1)} GB`;
      case 'network':
        return `${val.toFixed(1)} MB/s`;
      default:
        return val.toFixed(1);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <Skeleton className="h-4 w-[100px] mb-4" />
        <Skeleton className="h-8 w-[120px] mb-2" />
        <Skeleton className="h-4 w-[80px] mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn('text-2xl font-semibold', getStatusColor(value))}>
              {formatValue(value)}
            </span>
            {change !== undefined && (
              <span className={cn(
                'text-sm',
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {data && data.length > 0 && (
        <div className="h-[200px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="timestamp"
                type="category"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                stroke={isDark ? '#6B7280' : '#9CA3AF'}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke={isDark ? '#6B7280' : '#9CA3AF'}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.375rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{
                  color: isDark ? '#D1D5DB' : '#374151'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isDark ? '#60A5FA' : '#2563EB'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
} 