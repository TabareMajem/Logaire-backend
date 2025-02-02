import { supabase } from '@/lib/supabase/client';
import { CalendarProvider } from './types';
import { CalendarEvent } from "@/lib/api/calendar";
import { ErrorLogger } from '@/lib/errors/logger';
import { EventType } from '@/lib/api/calendar';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
}

export class GoogleCalendarProvider implements CalendarProvider {
  id = 'google';
  name = 'Google Calendar';
  type = 'google' as const;
  connected = false;

  private async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token ?? null;
  }

  async connect(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar'
        }
      });
      if (error) throw error;
      this.connected = true;
    } catch (error) {
      ErrorLogger.error('Failed to connect Google Calendar', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.connected = false;
    } catch (error) {
      ErrorLogger.error('Failed to disconnect Google Calendar', error as Error);
      throw error;
    }
  }

  async fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime'
        }),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      return data.items.map(this.mapToCalendarEvent);
    } catch (error) {
      ErrorLogger.error('Failed to fetch Google Calendar events', error as Error);
      throw error;
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const googleEvent = this.mapToGoogleEvent(event);
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(googleEvent)
        }
      );

      if (!response.ok) throw new Error('Failed to create event');
      
      const data = await response.json();
      return this.mapToCalendarEvent(data);
    } catch (error) {
      ErrorLogger.error('Failed to create Google Calendar event', error as Error);
      throw error;
    }
  }

  private mapToCalendarEvent(event: GoogleCalendarEvent): CalendarEvent {
    return {
      id: event.id,
      type: 'google' as EventType,
      title: event.summary,
      start: event.start.dateTime || event.start.date || '',
      end: event.end.dateTime || event.end.date || '',
      details: {
        location: event.location,
        description: event.description,
        attendees: event.attendees?.map(attendee => ({
          id: attendee.email, // Use email as id since Google Calendar API doesn't provide a separate id
          email: attendee.email,
          name: attendee.displayName || '', // Ensure name is always a string
          response: attendee.responseStatus
        }))
      }
    };
  }

  private mapToGoogleEvent(event: Omit<CalendarEvent, 'id'>): Partial<GoogleCalendarEvent> {
    return {
      summary: event.title,
      start: { dateTime: event.start },
      end: { dateTime: event.end },
      location: event.details?.location,
      description: event.details?.description,
      attendees: event.details?.attendees?.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name
      }))
    };
  }
}