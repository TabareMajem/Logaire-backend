import { BasePortConnector } from './base-connector';
import { VesselMovement } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class VesselConnector extends BasePortConnector {
  async getVesselSchedules(): Promise<VesselMovement[]> {
    try {
      const schedules = await this.makeRequest<any[]>(
        `/api/ports/${this.portId}/vessels/schedule`
      );
      return this.mapVesselMovements(schedules);
    } catch (error) {
      ErrorLogger.error('Failed to get vessel schedules', error as Error);
      throw error;
    }
  }

  async getVesselDetails(vesselId: string): Promise<{
    vesselId: string;
    name: string;
    type: string;
    capacity: number;
    currentLocation?: {
      coordinates: [number, number];
      timestamp: Date;
    };
  }> {
    try {
      const details = await this.makeRequest<any>(
        `/api/vessels/${vesselId}`
      );
      return this.mapVesselDetails(details);
    } catch (error) {
      ErrorLogger.error('Failed to get vessel details', error as Error);
      throw error;
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${process.env.VESSEL_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  private mapVesselMovements(data: any[]): VesselMovement[] {
    return data.map(movement => ({
      vesselId: movement.vessel_id,
      vesselName: movement.vessel_name,
      type: movement.movement_type,
      terminal: movement.terminal,
      scheduledTime: new Date(movement.scheduled_time),
      actualTime: movement.actual_time ? new Date(movement.actual_time) : undefined,
      status: movement.status
    }));
  }

  private mapVesselDetails(data: any): any {
    return {
      vesselId: data.vessel_id,
      name: data.name,
      type: data.type,
      capacity: data.capacity,
      currentLocation: data.current_location ? {
        coordinates: data.current_location.coordinates,
        timestamp: new Date(data.current_location.timestamp)
      } : undefined
    };
  }
}