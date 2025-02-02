"use client";

import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { fetchBookingTimeline, exportTimelineData } from '@/lib/api/timeline';
import { TimelineEventCard } from './timeline-event';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';

interface BookingTimelineProps {
  bookingId: string;
}

export function BookingTimeline({ bookingId }: BookingTimelineProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['booking-timeline', bookingId],
    queryFn: () => fetchBookingTimeline(bookingId)
  });

  const handleExport = async () => {
    try {
      const blob = await exportTimelineData(bookingId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-${bookingId}-timeline.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export timeline:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Booking Timeline</CardTitle>
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Booking Timeline</CardTitle>
        <Button variant="outline" size="icon" onClick={handleExport}>
          <Download className="h-4 w-4" />
          <span className="sr-only">Export timeline</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {events?.map((event) => (
              <TimelineEventCard key={event.id} event={event} />
            ))}
            {!events?.length && (
              <p className="text-center text-muted-foreground py-8">
                No timeline events found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}