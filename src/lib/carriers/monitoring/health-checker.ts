import { supabase } from '@/lib/supabase/client';
import { CarrierHub } from '../core/carrier-hub';
import { AlertService } from './alert-service';
import { ErrorLogger } from '@/lib/errors/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  error?: string;
}

export class HealthChecker {
  private readonly supabase = supabase;;
  private readonly alertService: AlertService;

  constructor(private readonly hub: CarrierHub) {
    this.alertService = new AlertService();
  }

  async checkHealth(): Promise<Record<string, HealthStatus>> {
    const status: Record<string, HealthStatus> = {};

    try {
      const carriers = this.hub.getCarriers();

      for (const [carrierId, adapter] of carriers) {
        status[carrierId] = await this.checkCarrierHealth(carrierId, adapter);
      }

      await this.updateHealthStatus(status);
      await this.createAlertsForIssues(status);

      return status;
    } catch (error) {
      ErrorLogger.error('Health check failed', error as Error);
      throw error;
    }
  }

  private async checkCarrierHealth(carrierId: string, adapter: any): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      await adapter.checkHealth();
      return {
        status: 'healthy',
        latency: Date.now() - startTime
      };
    } catch (error) {
      const status: HealthStatus = {
        status: this.determineStatus(error as Error),
        latency: Date.now() - startTime,
        error: (error as Error).message
      };

      ErrorLogger.error(`Health check failed for carrier ${carrierId}`, error as Error);
      return status;
    }
  }

  private determineStatus(error: Error): 'degraded' | 'down' {
    // Determine status based on error type/message
    if (error.message.includes('timeout') || error.message.includes('rate limit')) {
      return 'degraded';
    }
    return 'down';
  }

  private async updateHealthStatus(status: Record<string, HealthStatus>): Promise<void> {
    const { error } = await this.supabase
      .from('carrier_health')
      .insert(
        Object.entries(status).map(([carrierId, health]) => ({
          carrier_id: carrierId,
          status: health.status,
          latency: health.latency,
          error: health.error,
          checked_at: new Date().toISOString()
        }))
      );

    if (error) {
      ErrorLogger.error('Failed to update health status', error);
    }
  }

  private async createAlertsForIssues(status: Record<string, HealthStatus>): Promise<void> {
    for (const [carrierId, health] of Object.entries(status)) {
      if (health.status !== 'healthy') {
        await this.alertService.createAlert({
          carrierId,
          type: 'availability',
          severity: health.status === 'down' ? 'high' : 'medium',
          message: `Carrier ${carrierId} is ${health.status}`,
          details: {
            latency: health.latency,
            error: health.error
          }
        });
      }
    }
  }
}