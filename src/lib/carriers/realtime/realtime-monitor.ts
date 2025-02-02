import { supabase } from '@/lib/supabase/client';
import { CarrierHub } from '../core/carrier-hub';
import { MonitorService } from '../monitoring/monitor-service';
import { ErrorLogger } from '@/lib/errors/logger';

export class RealtimeMonitor {
  private supabase = supabase;;
  private monitorService: MonitorService;

  constructor(private readonly hub: CarrierHub) {
    this.monitorService = new MonitorService(hub);
  }

  async startMonitoring(): Promise<() => void> {
    try {
      // Set up real-time channel subscriptions
      const channel = this.supabase.channel('carrier-monitoring')
        // Listen for health status changes
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'carrier_health' },
          (payload) => this.handleHealthUpdate(payload.new)
        )
        // Listen for metrics updates
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'carrier_metrics' },
          (payload) => this.handleMetricsUpdate(payload.new)
        )
        // Listen for alerts
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'carrier_alerts' },
          (payload) => this.handleAlertCreated(payload.new)
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'carrier_alerts' },
          (payload) => this.handleAlertUpdated(payload.new)
        );

      // Subscribe to the channel
      await channel.subscribe();

      // Start periodic monitoring
      const monitoringInterval = setInterval(
        () => this.monitorService.monitorCarriers(),
        5 * 60 * 1000 // Every 5 minutes
      );

      // Return cleanup function
      return () => {
        channel.unsubscribe();
        clearInterval(monitoringInterval);
      };
    } catch (error) {
      ErrorLogger.error('Failed to start real-time monitoring', error as Error);
      throw error;
    }
  }

  private async handleHealthUpdate(health: any): Promise<void> {
    try {
      if (health.status !== 'healthy') {
        await this.monitorService.alertManager.createAlert({
          carrierId: health.carrier_id,
          type: 'availability',
          severity: health.status === 'down' ? 'high' : 'medium',
          message: `Carrier ${health.carrier_id} is ${health.status}`,
          details: {
            latency: health.latency,
            error: health.error
          }
        });
      }
    } catch (error) {
      ErrorLogger.error('Failed to handle health update', error as Error);
    }
  }

  private async handleMetricsUpdate(metrics: any): Promise<void> {
    try {
      // Check for performance issues
      if (metrics.error_rate > 0.1) { // 10% error rate threshold
        await this.monitorService.alertManager.createAlert({
          carrierId: metrics.carrier_id,
          type: 'performance',
          severity: 'high',
          message: `High error rate detected for ${metrics.carrier_id}`,
          details: {
            errorRate: metrics.error_rate,
            threshold: 0.1
          }
        });
      }

      if (metrics.average_latency > 2000) { // 2 second latency threshold
        await this.monitorService.alertManager.createAlert({
          carrierId: metrics.carrier_id,
          type: 'performance',
          severity: 'medium',
          message: `High latency detected for ${metrics.carrier_id}`,
          details: {
            latency: metrics.average_latency,
            threshold: 2000
          }
        });
      }
    } catch (error) {
      ErrorLogger.error('Failed to handle metrics update', error as Error);
    }
  }

  private async handleAlertCreated(alert: any): Promise<void> {
    try {
      // Trigger any necessary actions based on new alerts
      if (alert.severity === 'high') {
        // Implement high-priority alert handling
      }
    } catch (error) {
      ErrorLogger.error('Failed to handle alert creation', error as Error);
    }
  }

  private async handleAlertUpdated(alert: any): Promise<void> {
    try {
      // Handle alert resolution or updates
      if (alert.resolved) {
        // Implement alert resolution handling
      }
    } catch (error) {
      ErrorLogger.error('Failed to handle alert update', error as Error);
    }
  }
}