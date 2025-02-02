interface MetricCardProps {
    title: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
    delta?: number;
  }
  
  export function MetricCard({ title, value, trend = 'stable', delta = 0 }: MetricCardProps) {
    const trendClass = {
      up: 'text-green-500',
      down: 'text-red-500',
      stable: 'text-gray-500',
    };
  
    return (
      <div className="p-4 border rounded-lg shadow-sm">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className={`text-sm ${trendClass[trend]}`}>
          {trend === 'up' && '▲'}
          {trend === 'down' && '▼'}
          {trend === 'stable' && '—'} {Math.abs(delta).toFixed(2)}%
        </div>
      </div>
    );
  }
  