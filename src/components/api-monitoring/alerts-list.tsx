"use client";

import { formatDistanceToNow } from 'date-fns';
import { AlertService } from '@/lib/external-apis/monitoring/alert-service';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface AlertsListProps {
  alerts?: Array<{
    id: string;
    service: string;
    type: string;
    severity: string;
    message: string;
    created_at: string;
  }>;
}

export function AlertsList({ alerts }: AlertsListProps) {
  const { toast } = useToast();
  const alertService = new AlertService();

  const handleResolve = async (alertId: string) => {
    try {
      await alertService.resolveAlert(alertId);
      toast.success('Alert resolved successfully');
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  if (!alerts?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No active alerts
      </div>
    );
  }

  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start justify-between p-4 rounded-lg border"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium capitalize">{alert.service}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  alert.severity === 'high'
                    ? 'bg-red-100 text-red-800'
                    : alert.severity === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(alert.created_at))} ago
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolve(alert.id)}
            >
              Resolve
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}