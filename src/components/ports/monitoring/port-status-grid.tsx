"use client";

import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { PortStatus } from '@/lib/integrations/ports/types';

interface PortStatusGridProps {
  statuses: Record<string, PortStatus>;
  loading?: boolean;
}

export function PortStatusGrid({ statuses, loading }: PortStatusGridProps) {
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
      {Object.entries(statuses).map(([portId, status]) => (
        <Card key={portId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{portId}</h3>
              <StatusBadge status={status.operationalStatus} />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Congestion Level:</span>
                <span>{(status.congestionLevel * 100).toFixed(0)}%</span>
              </div>
              {status.weatherConditions && (
                <div className="flex items-center justify-between">
                  <span>Weather:</span>
                  <span>{status.weatherConditions.condition}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span>{formatDistanceToNow(status.lastUpdated)} ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: PortStatus['operationalStatus'] }) {
  const config = {
    operational: { icon: CheckCircle, variant: 'destructive' },
    limited: { icon: AlertTriangle, variant: 'default' },
    closed: { icon: Activity, variant: 'secondary' }
  } as const;

  const { icon: Icon, variant } = config[status];

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}