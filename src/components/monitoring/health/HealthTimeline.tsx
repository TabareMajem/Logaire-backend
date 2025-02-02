// src/conponents/monitoring/health/HealthTimeline.tsx -->

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase/client';
import {
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthTimelineProps {
  component: string | null;
  className?: string;
}

interface HealthDataPoint {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  errorRate?: number;
}

export function HealthTimeline({ component, className }: HealthTimelineProps) {
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadHealthHistory();
  }, [component]);

  const loadHealthHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .eq(component ? 'component' : 'type', component || 'system')
        .order('recorded_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setHealthData(data as HealthDataPoint[]);
    } catch (err) {
      setError(err as Error);
      showToast({
        type: 'error',
        message: 'Failed to load health history'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-600 mb-2">Failed to load health history</p>
        <button
          onClick={loadHealthHistory}
          className="text-blue-500 hover:text-blue-600"
        >
          Try again
        </button>
      </div>
    );
  }

  const statusToNumber = (status: string): number => {
    switch (status) {
      case 'healthy': return 2;
      case 'degraded': return 1;
      case 'unhealthy': return 0;
      default: return -1;
    }
  };

  const data = {
    labels: healthData.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: 'Status',
        data: healthData.map(d => statusToNumber(d.status)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        stepped: true
      },
      ...(healthData[0]?.latency ? [{
        label: 'Latency (ms)',
        data: healthData.map(d => d.latency),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        yAxisID: 'latency'
      }] : []),
      ...(healthData[0]?.errorRate ? [{
        label: 'Error Rate',
        data: healthData.map(d => d.errorRate ? d.errorRate * 100 : 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        yAxisID: 'errorRate'
      }] : [])
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: component ? `${component} Health History` : 'System Health History'
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const date = new Date(items[0].parsed.x);
            return formatDistanceToNow(date, { addSuffix: true });
          },
          label: (context) => {
            if (context.datasetIndex === 0) {
              const status = ['Unhealthy', 'Degraded', 'Healthy'][context.parsed.y];
              return `Status: ${status}`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute'
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        beginAtZero: true,
        max: 2,
        ticks: {
          callback: (value: string | number) => {
            const index = Number(value); // Explicitly convert value to a number
            return ['Unhealthy', 'Degraded', 'Healthy'][index] || '';
          },
        }
      },
      ...(healthData[0]?.latency ? {
        latency: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Latency (ms)'
          }
        }
      } : {}),
      ...(healthData[0]?.errorRate ? {
        errorRate: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Error Rate (%)'
          },
          max: 100
        }
      } : {})
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <Line data={data} options={options} />
    </div>
  );
} 