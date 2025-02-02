// src/components/dashboard/calendar/calendar-view.tsx -->

"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCalendarEvents } from '@/lib/api/calendar';
import { MonthView } from './views/month-view';
import { WeekView } from './views/week-view';
import { DayView } from './views/day-view';
import { CreateEventDialog } from './create-event-dialog';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { ViewSelect } from './view-select';

type CalendarView = 'month' | 'week' | 'day';

export function CalendarView() {
  const [view, setView] = useState<CalendarView>('week');
  const [date, setDate] = useState(new Date());

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', format(date, 'yyyy-MM')],
    queryFn: () => fetchCalendarEvents({
      start: startOfMonth(date),
      end: endOfMonth(date)
    })
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(subMonths(date, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(addMonths(date, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(date, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <ViewSelect value={view} onChange={(v) => setView(v as CalendarView)} />
          <CreateEventDialog />
        </div>
      </div>

      {view === 'month' && (
        <MonthView date={date} events={events || []} isLoading={isLoading} />
      )}
      {view === 'week' && (
        <WeekView date={date} events={events || []} isLoading={isLoading} />
      )}
      {view === 'day' && (
        <DayView date={date} events={events || []} isLoading={isLoading} />
      )}
    </Card>
  );
}