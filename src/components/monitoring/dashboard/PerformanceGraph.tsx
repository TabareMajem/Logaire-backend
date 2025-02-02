// src/components/monitoring/dashboard/PerformanceGraph.tsx
import { AgentMetrics } from '@/lib/monitoring/types';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceGraphProps {
  data: AgentMetrics[];
  timeRange: string;
}

export function PerformanceGraph({ data, timeRange }: PerformanceGraphProps) {
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    const processedData = processChartData(data, timeRange);
    setChartData(processedData);
  }, [data, timeRange]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Metrics Over Time'
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      },
      x: {
        type: 'category' as const,
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  };

  if (!chartData) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

function processChartData(data: AgentMetrics[], timeRange: string): ChartData<'line'> {
  // Process timestamps based on timeRange
  const timestamps = data.map(metric => {
    const date = new Date(metric.timestamp);
    switch (timeRange) {
      case '1h':
        return date.toLocaleTimeString();
      case '24h':
        return `${date.getHours()}:00`;
      case '7d':
        return date.toLocaleDateString();
      default:
        return date.toLocaleString();
    }
  });

  // Extract performance metrics
  const performanceData = data.map(metric => metric.performance);

  return {
    labels: timestamps,
    datasets: [
      {
        label: 'Performance',
        data: performanceData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };
}