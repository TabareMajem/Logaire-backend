import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class BookingCommandHandlers {
  private supabase = supabase;;

  async checkBookingStatus(params: { reference: string }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .select('status, scheduled_date')
        .eq('booking_number', params.reference)
        .single();

      if (error) throw error;

      return `Booking ${params.reference} is ${data.status}, scheduled for ${new Date(data.scheduled_date).toLocaleDateString()}`;
    } catch (error) {
      ErrorLogger.error('Check booking status command failed', error as Error);
      return `I couldn't find booking ${params.reference}`;
    }
  }

  async listUpcomingBookings(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .select('booking_number, scheduled_date')
        .gt('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(3);

      if (error) throw error;

      if (!data.length) {
        return "You don't have any upcoming bookings.";
      }

      const bookings = data.map(b => 
        `${b.booking_number} on ${new Date(b.scheduled_date).toLocaleDateString()}`
      ).join(', ');

      return `Your upcoming bookings are: ${bookings}`;
    } catch (error) {
      ErrorLogger.error('List bookings command failed', error as Error);
      return "I couldn't retrieve your upcoming bookings.";
    }
  }
}