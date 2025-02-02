"use client";

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export type TimelineEventType = 'pickup' | 'departure' | 'arrival' | 'delivery';
export type TimelineEventStatus = 'scheduled' | 'completed' | 'delayed';

export interface TimelineEvent {
  id: string;
  booking_id: string;
  type: TimelineEventType;
  scheduled_time: string;
  actual_time?: string;
  location: {
    name: string;
    coordinates: [number, number];
  };
  status: TimelineEventStatus;
  notes?: string;
}

export async function fetchBookingTimeline(bookingId: string): Promise<TimelineEvent[]> {
  try {
    
    const { data, error } = await supabase
      .from('booking_timeline')
      .select('*')
      .eq('booking_id', bookingId)
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch booking timeline', error as Error);
    throw error;
  }
}

export async function exportTimelineData(bookingId: string): Promise<Blob> {
  try {
    const events = await fetchBookingTimeline(bookingId);
    const csvData = events.map(event => ({
      type: event.type,
      location: event.location.name,
      scheduled: new Date(event.scheduled_time).toLocaleString(),
      actual: event.actual_time ? new Date(event.actual_time).toLocaleString() : 'N/A',
      status: event.status,
      notes: event.notes || ''
    }));

    const headers = ['Type', 'Location', 'Scheduled Time', 'Actual Time', 'Status', 'Notes'];
    const rows = [
      headers,
      ...csvData.map(event => [
        event.type,
        event.location,
        event.scheduled,
        event.actual,
        event.status,
        event.notes
      ])
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  } catch (error) {
    ErrorLogger.error('Failed to export timeline data', error as Error);
    throw error;
  }
}