import { Alert } from '@/lib/monitoring/alerts/alert-manager';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    TimeScale,
} from 'chart.js';
import { formatDistanceToNow } from 'date-fns';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Make sure TimeScale is imported
);

interface AlertChartProps {
  metric: string;
  alerts: Alert[];
}

export function AlertChart({ metric, alerts }: AlertChartProps) {
  const sortedAlerts = [...alerts].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const data = {
    labels: sortedAlerts.map(alert => new Date(alert.timestamp)),
    datasets: [
      {
        label: 'Value',
        data: sortedAlerts.map(alert => alert.message),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true
      },
      {
        label: 'Threshold',
        data: sortedAlerts.map(alert => alert.message),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${metric} Alerts Timeline`
      },
      tooltip: {
        callbacks: {
          title: (items: { parsed: { x: number | string } }[]) => {
            const date = new Date(items[0].parsed.x);
            return formatDistanceToNow(date, { addSuffix: true });
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time', // "time" type for Chart.js 4.x
        time: {
          unit: 'hour',
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line data={data} options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: `${metric} Alerts Timeline`
          },
          tooltip: {
            callbacks: {
              title: (items: { parsed: { x: number | string } }[]) => {
                const date = new Date(items[0].parsed.x);
                return formatDistanceToNow(date, { addSuffix: true });
              }
            }
          }
        },
        scales: {
          x: {
            type: 'timeseries', // Fixed type for Chart.js
            time: {
              unit: 'hour',
            },
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value',
            },
          },
        },
      }} />
    </div>
  );
}
