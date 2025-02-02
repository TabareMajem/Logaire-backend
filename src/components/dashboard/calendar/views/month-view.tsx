// src/components/dashboard/calendar/views/month-view.tsx -->

"use client";

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { CalendarEvent } from '@/lib/api/calendar';
import { EventCard } from '../event-card';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
}

export function MonthView({ date, events, isLoading }: MonthViewProps) {
  const days = useMemo(() => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  }, [date]);

  const eventsByDay = useMemo(() => {
    return events.reduce((acc, event) => {
      const day = format(new Date(event.start), 'yyyy-MM-dd');
      acc[day] = [...(acc[day] || []), event];
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square p-2 border rounded-lg bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsByDay[dayKey] || [];
        
        return (
          <div
            key={dayKey}
            className={cn(
              "aspect-square p-2 border rounded-lg",
              !isSameMonth(day, date) && "bg-muted/50"
            )}
          >
            <div className="font-medium text-sm mb-1">
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} variant="compact" />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}