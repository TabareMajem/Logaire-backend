// src/components/dashboard/calendar/views/day-view.tsx

"use client";

import { useMemo } from 'react';
import { format, eachHourOfInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { CalendarEvent } from '@/lib/api/calendar';
import { EventCard } from '../event-card';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
}

export function DayView({ date, events, isLoading }: DayViewProps) {
  const hours = useMemo(() => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return eachHourOfInterval({ start, end });
  }, [date]);

  const eventsByHour = useMemo(() => {
    return events.reduce((acc, event) => {
      const hour = format(parseISO(event.start), 'HH');
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hours.map((hour) => {
        const hourKey = format(hour, 'HH');
        const hourEvents = eventsByHour[hourKey] || [];

        return (
          <div key={hour.toString()} className="flex">
            <div className="w-20 py-2 text-sm text-muted-foreground">
              {format(hour, 'h:mm a')}
            </div>
            <div className="flex-1 min-h-[6rem] border rounded-lg p-2">
              {hourEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
