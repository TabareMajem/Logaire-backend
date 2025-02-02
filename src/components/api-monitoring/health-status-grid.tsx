"use client";

import { useQuery } from '@tanstack/react-query';
import { HealthCheck } from '@/lib/external-apis/monitoring/health-check';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

export function HealthStatusGrid() {
  const { data: healthStatus } = useQuery({
    queryKey: ['api-health'],
    queryFn: () => new HealthCheck().checkEndpoints(),
    refetchInterval: 60000 // Refresh every minute
  });

  if (!healthStatus) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 w-24 bg-muted rounded mb-4" />
            <div className="h-4 w-16 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Object.entries(healthStatus).map(([service, status]) => (
        <Card key={service} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium capitalize">{service}</h4>
            <StatusIcon status={status.status} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Latency</span>
              <span>{status.latency}ms</span>
            </div>
            {status.message && (
              <p className="text-sm text-muted-foreground">{status.message}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  const config = {
    healthy: { icon: Icons.checkCircle, className: 'text-green-500' },
    degraded: { icon: Icons.alertTriangle, className: 'text-yellow-500' },
    down: { icon: Icons.xCircle, className: 'text-red-500' }
  };

  const Icon = config[status].icon;
  return <Icon className={`h-5 w-5 ${config[status].className}`} />;
}