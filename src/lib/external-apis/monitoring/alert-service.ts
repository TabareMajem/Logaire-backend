import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface APIAlert {
  service: string;
  type: 'error' | 'latency' | 'availability';
  severity: 'low' | 'medium' | 'high';
  message: string;
  metadata?: Record<string, any>;
}

export class AlertService {
  private supabase = supabase;;

  async createAlert(alert: APIAlert): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_alerts')
        .insert({
          ...alert,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to create API alert', error as Error);
    }
  }

  async getActiveAlerts(service?: string): Promise<APIAlert[]> {
    try {
      let query = this.supabase
        .from('api_alerts')
        .select('*')
        .eq('resolved', false);

      if (service) {
        query = query.eq('service', service);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get active alerts', error as Error);
      throw error;
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to resolve alert', error as Error);
    }
  }
}