import { BaseExternalClient } from '../base-client';
import { ExternalAPIConfig } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface PortSchedule {
  portCode: string;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  holidays: string[];
  congestionLevel: number;
}

interface VesselMovement {
  vesselId: string;
  portCode: string;
  operation: 'arrival' | 'departure';
  scheduledTime: string;
  actualTime?: string;
  status: 'scheduled' | 'completed' | 'delayed';
}

export class PortAPIClient extends BaseExternalClient {
  constructor(config: ExternalAPIConfig) {
    super(config);
  }

  async getPortSchedule(portCode: string): Promise<PortSchedule> {
    try {
      const response = await this.request<PortSchedule>(`/ports/${portCode}/schedule`);
      return response.data;
    } catch (error) {
      ErrorLogger.error('Failed to fetch port schedule', error as Error);
      throw error;
    }
  }

  async getVesselMovements(
    portCode: string,
    date: string
  ): Promise<VesselMovement[]> {
    try {
      const response = await this.request<VesselMovement[]>(
        `/ports/${portCode}/movements`,
        { params: { date } }
      );
      return response.data;
    } catch (error) {
      ErrorLogger.error('Failed to fetch vessel movements', error as Error);
      throw error;
    }
  }
}