"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Ship } from 'lucide-react';
import { VesselMovement } from '@/lib/integrations/ports/types';

export function VesselMovements({ portId }: { portId: string }) {
  const { data: movements, isLoading } = useQuery({
    queryKey: ['vessel-movements', portId],
    queryFn: async () => {
      // Fetch vessel movements implementation
      return [] as VesselMovement[];
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vessel Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Vessel Movements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {!movements?.length ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No vessel movements
              </div>
            ) : (
              movements.map((movement) => (
                <div
                  key={`${movement.vesselId}-${movement.type}`}
                  className="flex items-start justify-between space-x-4 rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{movement.vesselName}</span>
                      <Badge variant={movement.type === 'arrival' ? 'default' : 'secondary'}>
                        {movement.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Terminal: {movement.terminal}
                    </p>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Scheduled: </span>
                      {formatDistanceToNow(movement.scheduledTime)} 
                      {movement.actualTime && (
                        <>
                          <span className="text-muted-foreground"> • Actual: </span>
                          {formatDistanceToNow(movement.actualTime)}
                        </>
                      )}
                    </div>
                  </div>
                  {/* <Badge variant={
                    movement.status === 'completed' ? 'success' :
                    movement.status === 'delayed' ? 'destructive' :
                    'secondary'
                  }>
                    {movement.status}
                  </Badge> */}

                  <Badge variant={
                    movement.status === 'completed' ? 'secondary' :  // Adjust 'success' to 'secondary' or another valid variant
                    movement.status === 'delayed' ? 'destructive' :
                    'default'
                  }>
                    {movement.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}