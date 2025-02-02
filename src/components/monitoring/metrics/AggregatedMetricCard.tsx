import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAggregatedMetrics } from '@/hooks/useAggregatedMetrics';
import { formatNumber } from '@/lib/utils/format';
import { MetricType } from '@/types/monitoring';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface AggregatedMetricCardProps {
  type: MetricType;
  title: string;
  window?: '1m' | '5m' | '15m' | '1h' | '1d';
  className?: string;
  formatValue?: (value: number) => string;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export function AggregatedMetricCard({
  type,
  title,
  window = '5m',
  className,
  formatValue = formatNumber,
  thresholds
}: AggregatedMetricCardProps) {
  const { current, min, max, avg, lastUpdate } = useAggregatedMetrics(type, window);

  const getStatusColor = (value: number) => {
    if (!thresholds) return 'text-gray-900';
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrend = () => {
    const diff = current - avg;
    const percentage = (diff / avg) * 100;
    return {
      direction: diff >= 0 ? 'up' : 'down',
      value: Math.abs(percentage)
    };
  };

  const trend = getTrend();

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 flex items-baseline">
            {lastUpdate ? (
              <>
                <p className={`text-2xl font-semibold ${getStatusColor(current)}`}>
                  {formatValue(current)}
                </p>
                <span className="ml-2 flex items-center text-sm">
                  {trend.direction === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`ml-1 ${
                    trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.value.toFixed(1)}%
                  </span>
                </span>
              </>
            ) : (
              <Skeleton className="h-9 w-24" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Min</p>
          <p className="font-medium">{formatValue(min)}</p>
        </div>
        <div>
          <p className="text-gray-500">Avg</p>
          <p className="font-medium">{formatValue(avg)}</p>
        </div>
        <div>
          <p className="text-gray-500">Max</p>
          <p className="font-medium">{formatValue(max)}</p>
        </div>
      </div>

      {lastUpdate && (
        <p className="mt-4 text-xs text-gray-500">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
} 