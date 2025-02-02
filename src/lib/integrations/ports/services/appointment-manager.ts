import { supabase } from '@/lib/supabase/client';
import { Appointment, PickupRequest, DeliveryRequest } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class AppointmentManager {
  private readonly supabase = supabase;;

  async createAppointment(params: {
    terminalId: string;
    type: 'pickup' | 'delivery';
    startTime: Date;
    endTime: Date;
    reference?: string;
    containerNumber?: string;
    bookingNumber?: string;
    trucking: {
      company: string;
      driver?: string;
      vehicle?: string;
    };
  }): Promise<Appointment> {
    try {
      const { data, error } = await this.supabase
        .from('terminal_appointments')
        .insert({
          terminal_id: params.terminalId,
          type: params.type,
          start_time: params.startTime.toISOString(),
          end_time: params.endTime.toISOString(),
          reference: params.reference,
          container_number: params.containerNumber,
          booking_number: params.bookingNumber,
          trucking_company: params.trucking.company,
          driver: params.trucking.driver,
          vehicle: params.trucking.vehicle,
          status: 'confirmed',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapAppointment(data);
    } catch (error) {
      ErrorLogger.error('Failed to create appointment', error as Error);
      throw error;
    }
  }

  async getAppointment(id: string): Promise<Appointment> {
    try {
      const { data, error } = await this.supabase
        .from('terminal_appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapAppointment(data);
    } catch (error) {
      ErrorLogger.error('Failed to get appointment', error as Error);
      throw error;
    }
  }

  async updateAppointment(
    id: string,
    updates: Partial<Appointment>
  ): Promise<Appointment> {
    try {
      const { data, error } = await this.supabase
        .from('terminal_appointments')
        .update({
          status: updates.status,
          start_time: updates.startTime?.toISOString(),
          end_time: updates.endTime?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapAppointment(data);
    } catch (error) {
      ErrorLogger.error('Failed to update appointment', error as Error);
      throw error;
    }
  }

  private mapAppointment(data: any): Appointment {
    return {
      id: data.id,
      type: data.type,
      terminalId: data.terminal_id,
      containerNumber: data.container_number,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      status: data.status,
      reference: data.reference,
      instructions: data.instructions
    };
  }
}