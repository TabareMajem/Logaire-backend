import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export abstract class BasePortConnector {
  protected readonly supabase = supabase;;

  constructor(protected readonly portId: string) {}

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`Port API error: ${response.status} ${response.statusText}`);
      }

      await this.recordMetric({
        operation: endpoint,
        duration: Date.now() - startTime,
        success: true
      });

      return response.json();
    } catch (error) {
      await this.recordMetric({
        operation: endpoint,
        duration: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      });
      
      ErrorLogger.error('Port API request failed', error as Error);
      throw error;
    }
  }

  protected abstract getAuthHeaders(): Record<string, string>;

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