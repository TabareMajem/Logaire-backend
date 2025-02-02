import { formatDistanceToNow } from 'date-fns';

interface HealthStatusCardProps {
  title: string;
  status?: 'healthy' | 'degraded' | 'unhealthy';
  value?: number;
  lastUpdated?: Date;
}

export function HealthStatusCard({ 
  title, 
  status, 
  value, 
  lastUpdated 
}: HealthStatusCardProps) {
  const statusColors = {
    healthy: 'bg-green-50 text-green-700 border-green-200',
    degraded: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    unhealthy: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${status ? statusColors[status] : 'bg-white'}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2">
        {value !== undefined ? (
          <span className="text-2xl font-semibold">{value}</span>
        ) : status ? (
          <span className="text-lg font-medium capitalize">{status}</span>
        ) : null}
      </div>
      {lastUpdated && (
        <p className="mt-1 text-xs text-gray-500">
          Updated {formatDistanceToNow(lastUpdated)} ago
        </p>
      )}
    </div>
  );
} 