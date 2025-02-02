// src/components/shipments/detail/tabs/tracking.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrackingTimeline } from '../tracking/timeline';
import { TrackingMap } from '../tracking/map';
import { fetchShipmentTracking } from '@/lib/api/shipments';

interface ShipmentTrackingProps {
  shipmentId: string;
}

export function ShipmentTracking({ shipmentId }: ShipmentTrackingProps) {
  const { data: events, refetch, isLoading } = useQuery({
    queryKey: ['shipment-tracking', shipmentId],
    queryFn: () => fetchShipmentTracking(shipmentId)
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tracking Events</h2>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Tracking
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <TrackingTimeline events={events} isLoading={isLoading} />
        </Card>
        
        <Card className="p-6">
          <TrackingMap events={events} />
        </Card>
      </div>
    </div>
  );
}