// src/components/shipments/status/status-history.tsx

"use client";

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { fetchStatusHistory } from '@/lib/api/status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipmentStatus } from '../../../components/shipments/shipment-status';

interface StatusHistoryProps {
  shipmentId: string;
}

export function StatusHistory({ shipmentId }: StatusHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['status-history', shipmentId],
    queryFn: () => fetchStatusHistory(shipmentId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history?.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShipmentStatus status={entry.previous_status} />
                  <span>→</span>
                  <ShipmentStatus status={entry.new_status} />
                </div>
                {entry.reason && (
                  <p className="text-sm text-muted-foreground">
                    Reason: {entry.reason}
                  </p>
                )}
              </div>
              <time className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(entry.created_at))} ago
              </time>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}