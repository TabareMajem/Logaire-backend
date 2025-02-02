import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface CarrierAlert {
  carrierId: string;
  type: 'error' | 'performance' | 'availability';
  severity: 'low' | 'medium' | 'high';
  message: string;
  details?: Record<string, any>;
}

export class AlertManager {
  private readonly supabase = supabase;;

  async createAlert(alert: CarrierAlert): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('carrier_alerts')
        .insert({
          carrier_id: alert.carrierId,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          details: alert.details,
          created_at: new Date().toISOString(),
          resolved: false
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to create carrier alert', error as Error);
    }
  }

  async getActiveAlerts(carrierId?: string): Promise<CarrierAlert[]> {
    try {
      let query = this.supabase
        .from('carrier_alerts')
        .select('*')
        .eq('resolved', false);

      if (carrierId) {
        query = query.eq('carrier_id', carrierId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get carrier alerts', error as Error);
      throw error;
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('carrier_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to resolve carrier alert', error as Error);
    }
  }
}