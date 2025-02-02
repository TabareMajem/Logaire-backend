// src/components/shipments/detail/tracking/timeline.tsx -->

"use client";

import { formatDistanceToNow } from 'date-fns';
import { MapPin } from 'lucide-react';
import { TrackingEvent } from '@/lib/api/shipments';
import { TrackingEventIcon } from './event-icon';
import { Skeleton } from '../../../../../components/ui/skeleton';

interface TrackingTimelineProps {
  events?: TrackingEvent[];
  isLoading: boolean;
}

export function TrackingTimeline({ events, isLoading }: TrackingTimelineProps) {
  if (isLoading) {
    return <TrackingTimelineSkeleton />;
  }

  if (!events?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No tracking events available
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
      
      <div className="space-y-8">
        {events.map((event) => (
          <div key={event.id} className="flex space-x-4">
            <div className="relative">
              <TrackingEventIcon type={event.event_type} />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{event.event_type}</p>
                <time className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp))} ago
                </time>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
              
              {event.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{event.location.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackingTimelineSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}