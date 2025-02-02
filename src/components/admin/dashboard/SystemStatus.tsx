import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHealthCheck } from '@/hooks/useHealthCheck';

export function SystemStatus() {
  const { healthStatus, isLoading, isHealthy, hasDegradedServices } = useHealthCheck();

  if (isLoading) {
    return <Skeleton className="h-6 w-24" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isHealthy ? 'default' : hasDegradedServices ? 'outline' : 'destructive'}
      >
        {isHealthy ? 'Healthy' : hasDegradedServices ? 'Degraded' : 'Unhealthy'}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {healthStatus.length} services monitored
      </span>
    </div>
  );
} 