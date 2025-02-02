import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export type EventType = 'booking' | 'pickup' | 'delivery' | 'meeting' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: EventType;
  details: {
    location?: string;
    description?: string;
    attendees?: {
      id: string;
      name: string;
      email: string;
    }[];
  };
  related_to?: {
    type: 'shipment' | 'booking';
    id: string;
    reference: string;
  };
}

export async function fetchCalendarEvents(params: {
  start: Date;
  end: Date;
}): Promise<CalendarEvent[]> {
  try {
    
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start', params.start.toISOString())
      .lte('end', params.end.toISOString())
      .order('start', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch calendar events', error as Error);
    throw error;
  }
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  try {
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to create calendar event', error as Error);
    throw error;
  }
}