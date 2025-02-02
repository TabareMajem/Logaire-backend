import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { AlertManager } from '../alerts/alert-manager';
import { SystemMetricsCollector } from '../metrics/system-metrics-collector';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency?: number;
      errorRate?: number;
      lastCheck: Date;
      message?: string;
    };
  };
  lastUpdated: Date;
}

export class SystemHealthMonitor {
  private static instance: SystemHealthMonitor;
  private metricsCollector: SystemMetricsCollector;
  private alertManager: AlertManager;
  private healthStatus: HealthStatus;
  private checkInterval: NodeJS.Timer | null = null;

  private constructor() {
    this.metricsCollector = SystemMetricsCollector.getInstance();
    this.alertManager = AlertManager.getInstance();
    this.healthStatus = this.getInitialHealthStatus();
  }

  static getInstance(): SystemHealthMonitor {
    if (!this.instance) {
      this.instance = new SystemHealthMonitor();
    }
    return this.instance;
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(async () => {
      await this.checkSystemHealth();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async checkSystemHealth(): Promise<HealthStatus> {
    try {
      const componentChecks = await Promise.all([
        this.checkDatabase(),
        this.checkAPI(),
        this.checkAgents(),
        this.checkQueue(),
        this.checkCache()
      ]);

      const components = componentChecks.reduce((acc, check) => ({
        ...acc,
        [check.name]: check.status
      }), {});

      this.healthStatus = {
        status: this.determineOverallStatus(components),
        components,
        lastUpdated: new Date()
      };

      await this.persistHealthStatus();
      await this.notifyStatusChange();

      return this.healthStatus;
    } catch (error) {
      ErrorLogger.error('Health check failed', error as Error);
      throw error;
    }
  }

  private async checkDatabase() {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .select('count')
        .limit(1);

      const latency = Date.now() - startTime;

      return {
        name: 'database',
        status: {
          status: error ? 'unhealthy' : latency > 1000 ? 'degraded' : 'healthy',
          latency,
          lastCheck: new Date(),
          message: error?.message
        }
      };
    } catch (error) {
      return {
        name: 'database',
        status: {
          status: 'unhealthy',
          lastCheck: new Date(),
          message: (error as Error).message
        }
      };
    }
  }

  private async checkAPI() {
    // Implementation for API health check
    return {
      name: 'api',
      status: {
        status: 'healthy',
        lastCheck: new Date()
      }
    };
  }

  private async checkAgents() {
    // Implementation for agents health check
    return {
      name: 'agents',
      status: {
        status: 'healthy',
        lastCheck: new Date()
      }
    };
  }

  private async checkQueue() {
    // Implementation for queue health check
    return {
      name: 'queue',
      status: {
        status: 'healthy',
        lastCheck: new Date()
      }
    };
  }

  private async checkCache() {
    // Implementation for cache health check
    return {
      name: 'cache',
      status: {
        status: 'healthy',
        lastCheck: new Date()
      }
    };
  }

  private determineOverallStatus(components: HealthStatus['components']): HealthStatus['status'] {
    const statuses = Object.values(components).map(c => c.status);
    if (statuses.some(s => s === 'unhealthy')) return 'unhealthy';
    if (statuses.some(s => s === 'degraded')) return 'degraded';
    return 'healthy';
  }

  private async persistHealthStatus(): Promise<void> {
    const { error } = await supabase
      .from('system_health')
      .insert({
        status: this.healthStatus.status,
        components: this.healthStatus.components,
        recorded_at: new Date().toISOString()
      });

    if (error) {
      ErrorLogger.error('Failed to persist health status', error);
    }
  }

  private async notifyStatusChange(): Promise<void> {
    // Implement notification logic for status changes
  }

  private getInitialHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      components: {},
      lastUpdated: new Date()
    };
  }
} 