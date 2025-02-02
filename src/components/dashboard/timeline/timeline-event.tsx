"use client";

import { formatDistanceToNow, format, isAfter } from 'date-fns';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { TimelineEvent } from '@/lib/api/timeline';
import { cn } from '@/lib/utils';
import { Badge } from '../../../../components/ui/badge';

interface TimelineEventProps {
  event: TimelineEvent;
}

const typeConfig = {
  pickup: { label: 'Pickup', color: 'bg-blue-500' },
  departure: { label: 'Departure', color: 'bg-purple-500' },
  arrival: { label: 'Arrival', color: 'bg-amber-500' },
  delivery: { label: 'Delivery', color: 'bg-green-500' },
} as const;

const statusConfig = {
  scheduled: { color: 'bg-slate-500' },
  completed: { color: 'bg-green-500' },
  delayed: { color: 'bg-red-500' },
} as const;

export function TimelineEventCard({ event }: TimelineEventProps) {
  const type = typeConfig[event.type];
  const status = statusConfig[event.status];
  const isDelayed = event.actual_time && 
    isAfter(new Date(event.actual_time), new Date(event.scheduled_time));

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 w-4 h-4 rounded-full border-2 border-background",
        status.color
      )} />
      
      {/* Timeline line */}
      <div className="absolute left-2 top-4 w-px h-full bg-border -z-10" />

      <div className="bg-card rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={type.color}>{type.label}</Badge>
            {isDelayed && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Delayed</span>
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(event.scheduled_time))} ago
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location.name}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="space-x-2">
              <span>Scheduled: {format(new Date(event.scheduled_time), 'PPp')}</span>
              {event.actual_time && (
                <>
                  <span>•</span>
                  <span>Actual: {format(new Date(event.actual_time), 'PPp')}</span>
                </>
              )}
            </div>
          </div>

          {event.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              {event.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}