import { supabase } from '@/lib/supabase/client';
import { ENDPOINTS } from '../config';
import { ErrorLogger } from '@/lib/errors/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastChecked: Date;
  message?: string;
}

export class HealthCheck {
  private supabase = supabase;;

  async checkEndpoints(): Promise<Record<string, HealthStatus>> {
    const results: Record<string, HealthStatus> = {};

    for (const [service, config] of Object.entries(ENDPOINTS)) {
      try {
        const start = Date.now();
        const response = await fetch(config.baseUrl);
        const latency = Date.now() - start;

        results[service] = {
          status: response.ok ? 'healthy' : 'degraded',
          latency,
          lastChecked: new Date(),
          message: response.ok ? undefined : response.statusText
        };

        await this.saveHealthStatus(service, results[service]);
      } catch (error) {
        ErrorLogger.error(`Health check failed for ${service}`, error as Error);
        
        results[service] = {
          status: 'down',
          latency: -1,
          lastChecked: new Date(),
          message: (error as Error).message
        };

        await this.saveHealthStatus(service, results[service]);
      }
    }

    return results;
  }

  private async saveHealthStatus(
    service: string,
    status: HealthStatus
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_health')
        .insert({
          service,
          status: status.status,
          latency: status.latency,
          message: status.message,
          checked_at: status.lastChecked.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to save health status', error as Error);
    }
  }
}