import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class ScheduleCommandHandlers {
  private supabase = supabase;;

  async getSchedules(params: { 
    origin: string; 
    destination: string;
    date?: string;
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_vessel_schedules', {
          origin_code: params.origin,
          destination_code: params.destination,
          departure_date: params.date
        });

      if (error) throw error;

      if (!data.length) {
        return `No schedules found for ${params.origin} to ${params.destination}`;
      }

      const nextSailing = data[0];
      return `Next sailing from ${params.origin} to ${params.destination} is on ${new Date(nextSailing.departure_date).toLocaleDateString()} with ${nextSailing.carrier}`;
    } catch (error) {
      ErrorLogger.error('Schedule command failed', error as Error);
      return "I couldn't find any schedules for that route.";
    }
  }

  async checkPortStatus(params: { port: string }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_port_status', {
          port_code: params.port
        });

      if (error) throw error;

      return `${params.port} is currently ${data.status} with ${data.congestion_level}% congestion`;
    } catch (error) {
      ErrorLogger.error('Port status command failed', error as Error);
      return `I couldn't get the status for port ${params.port}`;
    }
  }
}