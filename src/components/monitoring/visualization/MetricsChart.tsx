done done

import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import { formatNumber } from '@/lib/utils/format';
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
import { useEffect, useRef, useState } from 'react';
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

interface MetricsChartProps {
  title: string;
  metric: string;
  timeRange: string;
  color?: string;
}

export function MetricsChart({ title, metric, timeRange, color = 'rgb(75, 192, 192)' }: MetricsChartProps) {
  const [data, setData] = useState<any[]>([]);
  const socket = useMonitoringSocket();
  const chartRef = useRef<ChartJS>(null);

  useEffect(() => {
    // Load historical data
    loadHistoricalData();

    // Subscribe to real-time updates
    socket.subscribe(['metrics'], handleMetricUpdate);

    return () => {
      socket.unsubscribe(['metrics']);
    };
  }, [metric, timeRange]);

  const loadHistoricalData = async () => {
    const response = await fetch(`/api/monitoring/metrics/history?metric=${metric}&range=${timeRange}`);
    const historicalData = await response.json();
    setData(historicalData);
  };

  const handleMetricUpdate = (update: any) => {
    if (update.metric === metric) {
      setData(prev => {
        const newData = [...prev, update];
        // Keep only last N points based on timeRange
        return newData.slice(-getMaxDataPoints(timeRange));
      });
    }
  };

  const getMaxDataPoints = (range: string): number => {
    switch (range) {
      case '1h': return 60;
      case '6h': return 360;
      case '24h': return 1440;
      default: return 60;
    }
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    animation: {
      duration: 0 // Disable animation for real-time updates
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: title
      },
      tooltip: {
        callbacks: {
          label: (context) => `${formatNumber(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeRange === '1h' ? 'minute' : 'hour'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => formatNumber(value as number)
        }
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.timestamp),
    datasets: [
      {
        label: title,
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
} 