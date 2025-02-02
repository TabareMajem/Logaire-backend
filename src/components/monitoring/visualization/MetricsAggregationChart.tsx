import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select } from '@/components/ui/select';
import { metricsAggregationService } from '@/services/metrics-aggregation-service';
import { MetricType } from '@/types/monitoring';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

interface MetricsAggregationChartProps {
  metricType: MetricType;
  title: string;
  className?: string;
}

type WindowSize = '1m' | '5m' | '15m' | '1h' | '1d';

export function MetricsAggregationChart({
  metricType,
  title,
  className
}: MetricsAggregationChartProps) {
  const [windowSize, setWindowSize] = useState<WindowSize>('5m');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
    metricsAggregationService.startAggregation(metricType);

    const unsubscribe = metricsAggregationService.onAggregationComplete(
      (aggregation) => {
        if (
          aggregation.metricType === metricType &&
          aggregation.windowSize === windowSize
        ) {
          loadData();
        }
      }
    );

    return () => {
      unsubscribe();
      metricsAggregationService.stopAggregation(metricType);
    };
  }, [metricType, windowSize, dateRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const metrics = await metricsAggregationService.getAggregatedMetrics(
        metricType,
        windowSize,
        dateRange.from,
        dateRange.to
      );

      setData({
        labels: metrics.map(m => new Date(m.startTime).toLocaleString()),
        datasets: [
          {
            label: 'Average',
            data: metrics.map(m => m.avgValue),
            borderColor: 'rgb(75, 192, 192)',
            fill: false
          },
          {
            label: 'Min',
            data: metrics.map(m => m.minValue),
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            fill: false
          },
          {
            label: 'Max',
            data: metrics.map(m => m.maxValue),
            borderColor: 'rgb(54, 162, 235)',
            borderDash: [5, 5],
            fill: false
          }
        ]
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center space-x-2">
          <Select
            value={windowSize}
            onValueChange={(value) => setWindowSize(value as WindowSize)}
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
          </Select>
          <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                if (range) {
                  setDateRange(range); 
                }
              }}
            />
          <Button variant="outline" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center p-4 text-red-500">
          {error.message}
        </div>
      ) : data ? (
        <Line data={data} options={options} />
      ) : null}
    </Card>
  );
} 