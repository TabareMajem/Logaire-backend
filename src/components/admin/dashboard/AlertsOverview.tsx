import { Card } from '@/components/ui/card';
import { useAlerts } from '@/hooks/useAlerts';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../../../../components/ui/badge';

export function AlertsOverview() {
  const { alerts, isLoading } = useAlerts();

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="font-medium mb-4">Recent Alerts</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mt-2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const recentAlerts = alerts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">Recent Alerts</h3>
      <div className="space-y-4">
        {recentAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start justify-between border-b pb-4 last:border-0"
          >
            <div>
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </p>
            </div>
            <Badge variant={alert.severity === 'low' ? 'default' : 
                   alert.severity === 'medium' ? 'secondary' :
                   'destructive'}>{alert.severity}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
} 