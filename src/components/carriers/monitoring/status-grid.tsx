"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface CarrierStatus {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastCheck: Date;
  error?: string;
}

interface StatusGridProps {
  statuses: Record<string, CarrierStatus>;
  loading?: boolean;
}

export function StatusGrid({ statuses, loading }: StatusGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="mt-2 h-4 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(statuses).map(([carrier, status]) => (
        <Card key={carrier}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{carrier}</h3>
              <StatusBadge status={status.status} />
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Latency: {status.latency}ms</p>
              <p>Last check: {formatDistanceToNow(status.lastCheck)} ago</p>
              {status.error && (
                <p className="text-destructive">Error: {status.error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: CarrierStatus['status'] }) {
  const config = {
    healthy: { icon: CheckCircle, variant: 'default' },
    degraded: { icon: AlertTriangle, variant: 'secondary' },
    down: { icon: XCircle, variant: 'destructive' }
  } as const;

  const { icon: Icon, variant } = config[status];

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}