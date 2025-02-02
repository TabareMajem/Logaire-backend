import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select } from '@/components/ui/select';
import { alertEvaluationService } from '@/services/alert-evaluation-service';
import { metricsAggregationService } from '@/services/metrics-aggregation-service';
import { MetricType } from '@/types/monitoring';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

interface HistoricalDataChartProps {
  metricType: MetricType;
  title: string;
  className?: string;
  showAlerts?: boolean;
}

type TimeRange = '1h' | '6h' | '12h' | '1d' | '7d' | '30d';

export function HistoricalDataChart({
  metricType,
  title,
  className,
  showAlerts = true
}: HistoricalDataChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1d');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [metricType, timeRange, dateRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load metrics data
      const metrics = await metricsAggregationService.getAggregatedMetrics(
        metricType,
        timeRange,
        dateRange.from,
        dateRange.to
      );

      // Load alert evaluations if enabled
      let alertData: { x: string; y: number; }[] = [];
      if (showAlerts) {
        const rules = await alertEvaluationService.getEvaluationHistory(
          metricType,
          dateRange.from,
          dateRange.to
        );
        alertData = rules.filter(r => r.triggered).map(r => ({
          x: new Date(r.timestamp).toLocaleString(),
          y: r.value
        }));
      }

      setData({
        labels: metrics.map(m => new Date(m.startTime).toLocaleString()),
        datasets: [
          {
            label: 'Value',
            data: metrics.map(m => m.avgValue),
            borderColor: 'rgb(75, 192, 192)',
            fill: false
          },
          ...(showAlerts ? [
            {
              label: 'Alerts',
              data: alertData,
              borderColor: 'rgb(255, 99, 132)',
              pointStyle: 'triangle',
              pointRadius: 8,
              showLine: false
            }
          ] : [])
        ]
      });
    } catch (error) {
      console.error('Failed to load historical data:', error);
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
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Alerts') {
              return `Alert: ${context.raw.y}`;
            }
            return `Value: ${context.raw}`;
          }
        }
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
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <option value="1h">1 Hour</option>
            <option value="6h">6 Hours</option>
            <option value="12h">12 Hours</option>
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
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
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : data ? (
        <Line data={data} options={options} />
      ) : null}
    </Card>
  );
} 