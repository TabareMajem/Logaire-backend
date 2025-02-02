// src/components/shipments/detail/tracking/map.tsx -->

"use client";

import { useMemo } from 'react';
import { TrackingEvent } from '@/lib/api/shipments';

interface TrackingMapProps {
  events?: TrackingEvent[];
}

export function TrackingMap({ events }: TrackingMapProps) {
  const locations = useMemo(() => {
    if (!events) return [];
    return events
      .filter(event => event.location?.coordinates)
      .map(event => ({
        type: event.event_type,
        coordinates: event.location!.coordinates,
        name: event.location!.name,
        timestamp: event.timestamp,
      }));
  }, [events]);

  if (!locations.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No location data available
      </div>
    );
  }

  return (
    <div className="h-[400px] bg-muted rounded-lg">
      {/* Map implementation goes here */}
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Map visualization coming soon
      </div>
    </div>
  );
}