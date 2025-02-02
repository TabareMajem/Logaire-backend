import { Card } from '@/components/ui/card';
import {

    Line,
    LineChart,
    ResponsiveContainer,
} from 'recharts';


interface MetricsCardProps {
    title: string;
    value: number | string;
    trend: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
    chart: any[];
  }
  
  function MetricsCard({ title, value, trend, chart }: MetricsCardProps) {
    return (
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="text-sm text-gray-500">{title}</h3>
          <div className="text-2xl font-semibold">{value}</div>
          <div className={`text-sm ${getTrendColor(trend.direction)}`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
            {' '}
            {trend.percentage}%
          </div>
        </div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }
  
  function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  } 