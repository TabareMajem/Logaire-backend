"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { GoogleCalendarProvider } from '@/lib/calendar/providers/google';
import { CalendarProvider } from '@/lib/calendar/providers/types';

const providers: CalendarProvider[] = [
  new GoogleCalendarProvider(),
  // Add more providers as needed
];

export function useCalendarSync() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    let syncInterval: NodeJS.Timeout;

    const syncCalendars = async () => {
      for (const provider of providers) {
        if (!provider.connected) continue;

        try {
          const start = new Date();
          const end = new Date();
          end.setMonth(end.getMonth() + 1);

          const events = await provider.fetchEvents(start, end);
          
          // Update local calendar with external events
          queryClient.setQueryData(['calendar-events'], (oldEvents: any = []) => {
            const externalEvents = events.map(event => ({
              ...event,
              source: provider.id
            }));
            return [...oldEvents, ...externalEvents];
          });
        } catch (error) {
          toast.error(`Failed to sync with ${provider.name}`);
        }
      }
    };

    // Initial sync
    syncCalendars();

    // Sync every 5 minutes
    syncInterval = setInterval(syncCalendars, 5 * 60 * 1000);

    return () => {
      clearInterval(syncInterval);
    };
  }, [queryClient, toast]);
}