// src/lib/calendar/providers/types.ts -->

import { CalendarEvent } from "@/lib/api/calendar";

export interface CalendarProvider {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'ical';
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchEvents: (start: Date, end: Date) => Promise<CalendarEvent[]>;
  createEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
}

export interface ExternalCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  attendees?: Array<{
    email: string;
    name?: string;
    response?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
}