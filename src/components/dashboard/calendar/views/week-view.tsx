// src/components/dashboard/calendar/views/week-view.tsx -->

"use client";

import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, isSameDay, parseISO } from 'date-fns';
import { CalendarEvent } from '@/lib/api/calendar';
import { EventCard } from '../event-card';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
}

export function WeekView({ date, events, isLoading }: WeekViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [date]);

  const hours = useMemo(() => {
    const start = startOfWeek(date);
    return eachHourOfInterval({ start, end: new Date(start.setHours(23)) });
  }, [date]);

  const eventsByDay = useMemo(() => {
    return events.reduce((acc, event) => {
      const day = format(new Date(event.start), 'yyyy-MM-dd');
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-8 gap-1">
      {/* Time labels */}
      <div className="space-y-4 pr-4">
        {hours.map((hour) => (
          <div key={hour.toString()} className="h-20 text-sm text-muted-foreground">
            {format(hour, 'h a')}
          </div>
        ))}
      </div>

      {/* Days */}
      {days.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsByDay[dayKey] || [];

        return (
          <div key={dayKey} className="relative">
            <div className="text-sm font-medium mb-2 text-center">
              {format(day, 'EEE d')}
            </div>
            <div className="space-y-4">
              {hours.map((hour) => (
                <div
                  key={hour.toString()}
                  className={cn(
                    "h-20 border rounded-lg",
                    isSameDay(day, date) && "bg-accent/50"
                  )}
                >
                  {dayEvents
                    .filter(event => {
                      const eventHour = parseISO(event.start).getHours();
                      return eventHour === hour.getHours();
                    })
                    .map(event => (
                      <EventCard key={event.id} event={event} variant="compact" />
                    ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}