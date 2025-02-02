import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { ErrorLogger } from '@/lib/errors/logger';

interface CarrierSchedule {
  carrierId: string;
  availability: {
    vessel: string;
    route: string;
    departures: Date[];
    capacity: number;
  }[];
  reliability: number;
}

export class CarrierScheduleService {
  private supabase = supabase;

  async getAvailability(route: Route): Promise<CarrierSchedule[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_carrier_schedules', {
          origin_port: route.origin.name,
          destination_port: route.destination.name
        });

      if (error) throw error;

      return this.processCarrierSchedules(data);
    } catch (error) {
      ErrorLogger.error('Failed to fetch carrier schedules', error as Error);
      throw error;
    }
  }

  private processCarrierSchedules(data: any[]): CarrierSchedule[] {
    return data.map(carrier => ({
      carrierId: carrier.carrier_id,
      availability: carrier.schedules.map((schedule: any) => ({
        vessel: schedule.vessel_name,
        route: schedule.service_route,
        departures: schedule.departure_dates.map((d: string) => new Date(d)),
        capacity: schedule.available_capacity
      })),
      reliability: carrier.reliability_score
    }));
  }
}