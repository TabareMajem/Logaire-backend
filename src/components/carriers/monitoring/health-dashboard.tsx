"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { CarrierService } from '@/lib/carriers/core/carrier-service';

export function CarrierHealthDashboard() {
  const { data: healthStatus, isLoading } = useQuery({
    queryKey: ['carrier-health'],
    queryFn: async () => {
      const service = new CarrierService();
      return service.getCarrierHealth();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-6 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {healthStatus && Object.entries(healthStatus).map(([carrier, status]) => (
          <Card key={carrier}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {carrier}
              </CardTitle>
              <StatusBadge status={status.status} />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Last checked: {formatDistanceToNow(status.lastCheck)} ago
                {status.error && (
                  <p className="mt-1 text-destructive">
                    Error: {status.error}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MetricRow
              icon={Activity}
              label="Active Carriers"
              value={Object.keys(healthStatus || {}).length}
            />
            <MetricRow
              icon={CheckCircle}
              label="Healthy"
              value={Object.values(healthStatus || {}).filter(s => s.status === 'healthy').length}
              className="text-green-500"
            />
            <MetricRow
              icon={AlertTriangle}
              label="Degraded"
              value={Object.values(healthStatus || {}).filter(s => s.status === 'degraded').length}
              className="text-yellow-500"
            />
            <MetricRow
              icon={XCircle}
              label="Down"
              value={Object.values(healthStatus || {}).filter(s => s.status === 'down').length}
              className="text-red-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  const config = {
    healthy: { variant: 'destructive', icon: CheckCircle },
    degraded: { variant: 'default', icon: AlertTriangle },
    down: { variant: 'destructive', icon: XCircle }
  } as const;

  const { variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function MetricRow({ 
  icon: Icon, 
  label, 
  value, 
  className 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${className}`} />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}