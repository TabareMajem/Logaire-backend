// src/component/monitoring/visualization/AdvancedMetricsChart.tsx -->

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select } from '@/components/ui/select';
import { metricsAggregationService } from '@/services/metrics-aggregation-service';
import { MetricType } from '@/types/monitoring';
import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

interface AdvancedMetricsChartProps {
  metrics: MetricType[];
  title: string;
  className?: string;
}

type TimeWindow = '1h' | '6h' | '12h' | '1d' | '7d' | '30d';

export function AdvancedMetricsChart({
  metrics,
  title,
  className
}: AdvancedMetricsChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricType>>(new Set([metrics[0]]));
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1d');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const colors = useMemo(() => ({
    cpu: 'rgb(75, 192, 192)',
    memory: 'rgb(255, 99, 132)',
    disk: 'rgb(54, 162, 235)',
    network: 'rgb(153, 102, 255)'
  }), []);

  useEffect(() => {
    loadData();
  }, [selectedMetrics, timeWindow, dateRange]);

  const loadData = async () => {
    if (selectedMetrics.size === 0) return;

    try {
      setIsLoading(true);
      const datasets = await Promise.all(
        Array.from(selectedMetrics).map(async (metric) => {
          const data = await metricsAggregationService.getAggregatedMetrics(
            metric,
            timeWindow,
            dateRange.from,
            dateRange.to
          );

          return {
            label: metric.toUpperCase(),
            data: data.map(m => m.avgValue),
            borderColor: colors[metric],
            fill: false,
            tension: 0.4
          };
        })
      );

      const timestamps = (await metricsAggregationService.getAggregatedMetrics(
        Array.from(selectedMetrics)[0],
        timeWindow,
        dateRange.from,
        dateRange.to
      )).map(m => new Date(m.startTime).toLocaleString());

      setData({
        labels: timestamps,
        datasets
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMetric = (metric: MetricType) => {
    const newSelection = new Set(selectedMetrics);
    if (newSelection.has(metric)) {
      newSelection.delete(metric);
    } else {
      newSelection.add(metric);
    }
    setSelectedMetrics(newSelection);
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
        <div className="space-x-2">
          {metrics.map(metric => (
            <Button
              key={metric}
              variant={selectedMetrics.has(metric) ? "default" : "outline"}
              onClick={() => toggleMetric(metric)}
            >
              {metric.toUpperCase()}
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={timeWindow}
            onValueChange={(value) => setTimeWindow(value as TimeWindow)}
          >
            <option value="1h">1 Hour</option>
            <option value="6h">6 Hours</option>
            <option value="12h">12 Hours</option>
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </Select>
          {/* <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onChange={setDateRange}
          /> */}

          <DateRangePicker
            value={dateRange}
            onChange={(range) => {
              if (range) {
                setDateRange(range); // Assign directly if range is defined
              }
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : data ? (
        <Line data={data} options={options} />
      ) : null}
    </Card>
  );
} 