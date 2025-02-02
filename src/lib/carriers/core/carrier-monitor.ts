import { supabase } from '@/lib/supabase/client';
import { CarrierHub } from './carrier-hub';
import { ErrorLogger } from '@/lib/errors/logger';

interface HealthCheck {
  carrier: string;
  endpoint: string;
  success: boolean;
  latency: number;
  error?: string;
  timestamp: Date;
}

export class CarrierMonitor {
  private readonly supabase = supabase;;
  private readonly hub: CarrierHub;

  constructor(hub: CarrierHub) {
    this.hub = hub;
  }

  async monitorHealth(): Promise<void> {
    try {
      const healthChecks = await this.performHealthChecks();
      await this.updateHealthStatus(healthChecks);
      await this.notifyOnIssues(healthChecks);
    } catch (error) {
      ErrorLogger.error('Health monitoring failed', error as Error);
    }
  }

  private async performHealthChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    for (const [carrier, adapter] of this.hub.getCarriers()) {
      const endpoints = ['rates', 'booking', 'tracking'];
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        try {
          await adapter.checkEndpoint(endpoint);
          checks.push({
            carrier,
            endpoint,
            success: true,
            latency: Date.now() - startTime,
            timestamp: new Date()
          });
        } catch (error) {
          checks.push({
            carrier,
            endpoint,
            success: false,
            latency: Date.now() - startTime,
            error: (error as Error).message,
            timestamp: new Date()
          });
        }
      }
    }

    return checks;
  }

  private async updateHealthStatus(checks: HealthCheck[]): Promise<void> {
    const carrierStatus = this.aggregateHealthChecks(checks);

    for (const [carrier, status] of Object.entries(carrierStatus)) {
      const { error } = await this.supabase
        .from('carrier_health')
        .insert({
          carrier_id: carrier,
          status: status.status,
          latency: status.latency,
          error: status.error,
          checked_at: new Date().toISOString()
        });

      if (error) {
        ErrorLogger.error('Failed to update carrier health status', error);
      }
    }
  }

  private aggregateHealthChecks(checks: HealthCheck[]): Record<string, {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    error?: string;
  }> {
    const status: Record<string, {
      status: 'healthy' | 'degraded' | 'down';
      latency: number;
      error?: string;
    }> = {};

    for (const carrier of new Set(checks.map(c => c.carrier))) {
      const carrierChecks = checks.filter(c => c.carrier === carrier);
      const failedChecks = carrierChecks.filter(c => !c.success);
      const avgLatency = carrierChecks.reduce((sum, c) => sum + c.latency, 0) / carrierChecks.length;

      status[carrier] = {
        status: failedChecks.length === 0 ? 'healthy' :
                failedChecks.length < carrierChecks.length ? 'degraded' : 'down',
        latency: avgLatency,
        error: failedChecks[0]?.error
      };
    }

    return status;
  }

  private async notifyOnIssues(checks: HealthCheck[]): Promise<void> {
    const failedChecks = checks.filter(check => !check.success);
    
    if (failedChecks.length > 0) {
      const { error } = await this.supabase
        .from('carrier_alerts')
        .insert(
          failedChecks.map(check => ({
            carrier_id: check.carrier,
            type: 'health_check',
            severity: check.error?.includes('timeout') ? 'high' : 'medium',
            message: `Health check failed for ${check.carrier} ${check.endpoint}`,
            details: {
              endpoint: check.endpoint,
              error: check.error,
              latency: check.latency
            },
            created_at: new Date().toISOString()
          }))
        );

      if (error) {
        ErrorLogger.error('Failed to create carrier alerts', error);
      }
    }
  }
}