import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { ErrorLogger } from '@/lib/errors/logger';

interface PortSchedule {
  portCode: string;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  holidays: Date[];
  restrictions: string[];
  congestionLevel: number;
}

export class PortScheduleService {
  private supabase = supabase;

  async getOperationHours(route: Route): Promise<Record<string, PortSchedule>> {
    try {
      const portCodes = this.extractPortCodes(route);
      const { data, error } = await this.supabase
        .from('port_schedules')
        .select('*')
        .in('port_code', portCodes);

      if (error) throw error;

      return this.processPortSchedules(data);
    } catch (error) {
      ErrorLogger.error('Failed to fetch port schedules', error as Error);
      throw error;
    }
  }

  private extractPortCodes(route: Route): string[] {
    const locations = [route.origin, ...route.via, route.destination];
    return locations
      .filter(location => location.type === 'port')
      .map(location => location.name);
  }

  private processPortSchedules(data: any[]): Record<string, PortSchedule> {
    return data.reduce((acc, schedule) => ({
      ...acc,
      [schedule.port_code]: {
        portCode: schedule.port_code,
        workingHours: {
          start: schedule.working_hours_start,
          end: schedule.working_hours_end,
          timezone: schedule.timezone
        },
        holidays: schedule.holidays.map((d: string) => new Date(d)),
        restrictions: schedule.restrictions || [],
        congestionLevel: schedule.congestion_level
      }
    }), {});
  }
}