// src/components/dashboard/calendar/event-card.tsx -->

"use client";

import { CalendarEvent } from '@/lib/api/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  variant?: 'default' | 'compact';
}

const typeConfig = {
  booking: { color: 'bg-blue-500', textColor: 'text-blue-500' },
  pickup: { color: 'bg-green-500', textColor: 'text-green-500' },
  delivery: { color: 'bg-purple-500', textColor: 'text-purple-500' },
  meeting: { color: 'bg-amber-500', textColor: 'text-amber-500' },
  other: { color: 'bg-slate-500', textColor: 'text-slate-500' },
} as const;

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const config = typeConfig[event.type];

  if (variant === 'compact') {
    return (
      <div className={cn(
        "px-2 py-0.5 rounded text-xs truncate",
        config.color,
        "text-white"
      )}>
        {event.title}
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={cn(
          "w-1 h-full absolute left-0 top-0 rounded-l-lg",
          config.color
        )} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{event.title}</h4>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{format(new Date(event.start), 'h:mm a')}</span>
            {event.details.location && (
              <>
                <span>•</span>
                <span className="truncate">{event.details.location}</span>
              </>
            )}
          </div>
          {event.details.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {event.details.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}