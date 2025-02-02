import { BasePortConnector } from './base-connector';
import { TerminalSchedule } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class TerminalConnector extends BasePortConnector {
  async getSchedules(terminalId: string): Promise<TerminalSchedule[]> {
    try {
      const schedules = await this.makeRequest<any[]>(
        `/api/terminals/${terminalId}/schedules`
      );
      return this.mapSchedules(schedules);
    } catch (error) {
      ErrorLogger.error('Failed to get terminal schedules', error as Error);
      throw error;
    }
  }

  async getAvailability(terminalId: string, date: Date): Promise<{
    slots: Array<{
      startTime: Date;
      endTime: Date;
      available: boolean;
    }>;
    restrictions?: string[];
  }> {
    try {
      const availability = await this.makeRequest<any>(
        `/api/terminals/${terminalId}/availability`,
        {
          method: 'POST',
          body: JSON.stringify({ date: date.toISOString() })
        }
      );
      return this.mapAvailability(availability);
    } catch (error) {
      ErrorLogger.error('Failed to get terminal availability', error as Error);
      throw error;
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${process.env.TERMINAL_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  private mapSchedules(data: any[]): TerminalSchedule[] {
    return data.map(schedule => ({
      terminalId: schedule.terminal_id,
      workingHours: {
        start: schedule.working_hours.start,
        end: schedule.working_hours.end,
        timezone: schedule.working_hours.timezone
      },
      slots: schedule.slots.map((slot: any) => ({
        startTime: new Date(slot.start_time),
        endTime: new Date(slot.end_time),
        available: slot.available,
        type: slot.type
      })),
      restrictions: schedule.restrictions
    }));
  }

  private mapAvailability(data: any): any {
    return {
      slots: data.slots.map((slot: any) => ({
        startTime: new Date(slot.start_time),
        endTime: new Date(slot.end_time),
        available: slot.available
      })),
      restrictions: data.restrictions
    };
  }
}