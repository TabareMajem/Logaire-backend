import { BookingRequest, BookingConfirmation } from './types';
import { CarrierService } from './carrier-service';
import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

export class BookingService {
  private carrierService: CarrierService;

  constructor() {
    this.carrierService = new CarrierService();
  }

  async createBooking(carrierId: string, request: BookingRequest): Promise<BookingConfirmation> {
    try {
      // Create booking with carrier
      const confirmation = await this.carrierService.createBooking(carrierId, request);
      
      // Store booking in database
      await this.saveBooking(confirmation);
      
      return confirmation;
    } catch (error) {
      ErrorLogger.error('Failed to create booking', error as Error);
      throw error;
    }
  }

  private async saveBooking(booking: BookingConfirmation): Promise<void> {
    try {
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          booking_number: booking.bookingNumber,
          carrier: booking.carrier,
          status: booking.status,
          equipment_type: booking.equipment.type,
          equipment_quantity: booking.equipment.quantity,
          vessel: booking.schedule.vessel,
          voyage: booking.schedule.voyage,
          departure_date: booking.schedule.departureDate,
          arrival_date: booking.schedule.arrivalDate,
          cutoff_date: booking.schedule.cutoffDate
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to save booking to database', error as Error);
      throw error;
    }
  }
}