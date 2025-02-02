import { HealthChecker } from './health-checker';
import { MetricsService } from './metrics-service';
import { AlertManager } from './alert-manager';
import { CarrierHub } from '../core/carrier-hub';
import { ErrorLogger } from '@/lib/errors/logger';

export class MonitorService {
  private healthChecker: HealthChecker;
  private metricsService: MetricsService;
  public alertManager: AlertManager;

  constructor(private readonly hub: CarrierHub) {
    this.healthChecker = new HealthChecker(hub);
    this.metricsService = new MetricsService();
    this.alertManager = new AlertManager();
  }

  async monitorCarriers(): Promise<void> {
    try {
      // Check carrier health
      const healthStatus = await this.healthChecker.checkHealth();

      // Process health status
      for (const [carrierId, status] of Object.entries(healthStatus)) {
        // Record metrics
        await this.metricsService.recordMetric({
          carrierId,
          operation: 'health_check',
          duration: status.latency,
          success: status.status === 'healthy',
          error: status.error
        });

        // Create alerts for unhealthy carriers
        if (status.status !== 'healthy') {
          await this.alertManager.createAlert({
            carrierId,
            type: 'availability',
            severity: status.status === 'down' ? 'high' : 'medium',
            message: `Carrier ${carrierId} is ${status.status}`,
            details: {
              latency: status.latency,
              error: status.error
            }
          });
        }
      }
    } catch (error) {
      ErrorLogger.error('Carrier monitoring failed', error as Error);
    }
  }

  async checkLatencyThresholds(): Promise<void> {
    try {
      const carriers = this.hub.getCarriers(); // This will return the map of carriers
  
      // Loop over the carriers
      for (const [carrierId, carrierAdapter] of carriers) {
        const metrics = await this.metricsService.getMetrics(carrierId);
  
        if (metrics.averageLatency > 2000) { // 2 seconds threshold
          await this.alertManager.createAlert({
            carrierId,
            type: 'performance',
            severity: 'medium',
            message: `High latency detected for ${carrierId}`,
            details: {
              latency: metrics.averageLatency,
              threshold: 2000
            }
          });
        }
      }
    } catch (error) {
      ErrorLogger.error('Latency check failed', error as Error);
    }
  }
  
  async checkErrorRates(): Promise<void> {
    try {
      const carriers = this.hub.getCarriers(); // This will return the map of carriers
  
      // Loop over the carriers
      for (const [carrierId, carrierAdapter] of carriers) {
        const metrics = await this.metricsService.getMetrics(carrierId);
        const errorRate = metrics.errorCount / metrics.requestCount;
  
        if (errorRate > 0.1) { // 10% error rate threshold
          await this.alertManager.createAlert({
            carrierId,
            type: 'error',
            severity: 'high',
            message: `High error rate detected for ${carrierId}`,
            details: {
              errorRate: errorRate,
              threshold: 0.1
            }
          });
        }
      }
    } catch (error) {
      ErrorLogger.error('Error rate check failed', error as Error);
    }
  }
}