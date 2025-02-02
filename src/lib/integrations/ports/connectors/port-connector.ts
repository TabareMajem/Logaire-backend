import { supabase } from '@/lib/supabase/client';
import { 
  PortStatus, 
  TerminalSchedule, 
  CongestionUpdate, 
  VesselMovement 
} from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export abstract class PortConnector {
  protected readonly supabase = supabase;;
  protected readonly portId: string;

  constructor(portId: string) {
    this.portId = portId;
  }

  abstract getCongestionLevel(): Promise<number>;
  abstract getVesselSchedules(): Promise<any>;
  abstract getTerminalStatus(): Promise<any>;
  abstract getWeatherConditions(): Promise<any>;
  abstract getTerminalSchedules(terminalId: string): Promise<TerminalSchedule[]>;

  subscribeToCongestion(callback: (update: CongestionUpdate) => void): () => void {
    try {
      const channel = this.supabase.channel(`port-congestion-${this.portId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'port_congestion',
            filter: `port_id=eq.${this.portId}`
          },
          (payload) => {
            callback({
              portId: payload.new.port_id,
              level: payload.new.level,
              timestamp: new Date(payload.new.timestamp),
              details: payload.new.details
            });
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      ErrorLogger.error('Failed to subscribe to congestion updates', error as Error);
      return () => {};
    }
  }

  subscribeToVesselMovements(callback: (movement: VesselMovement) => void): () => void {
    try {
      const channel = this.supabase.channel(`vessel-movements-${this.portId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'vessel_movements',
            filter: `port_id=eq.${this.portId}`
          },
          (payload) => {
            callback({
              vesselId: payload.new.vessel_id,
              vesselName: payload.new.vessel_name,
              type: payload.new.movement_type,
              terminal: payload.new.terminal,
              scheduledTime: new Date(payload.new.scheduled_time),
              actualTime: payload.new.actual_time ? new Date(payload.new.actual_time) : undefined,
              status: payload.new.status
            });
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      ErrorLogger.error('Failed to subscribe to vessel movements', error as Error);
      return () => {};
    }
  }

  protected async recordMetric(params: {
    operation: string;
    duration: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('port_metrics')
        .insert({
          port_id: this.portId,
          operation: params.operation,
          duration: params.duration,
          success: params.success,
          error_message: params.error,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record port metric', error as Error);
    }
  }
}