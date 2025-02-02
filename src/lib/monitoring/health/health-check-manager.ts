import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { EventEmitter } from 'events';
import { AgentManager } from '../agents/agent-manager';

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  errorRate?: number;
  message?: string;
  timestamp: string;
}

export class HealthCheckManager extends EventEmitter {
  private static instance: HealthCheckManager;
  private checkInterval: NodeJS.Timer | null = null;
  private readonly defaultInterval = 60000; // 1 minute

  private constructor() {
    super();
  }

  static getInstance(): HealthCheckManager {
    if (!this.instance) {
      this.instance = new HealthCheckManager();
    }
    return this.instance;
  }

  async startHealthChecks(interval: number = this.defaultInterval): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    await this.performHealthCheck();
    this.checkInterval = setInterval(() => this.performHealthCheck(), interval);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const results = await Promise.all([
        this.checkAgentHealth(),
        this.checkDatabaseHealth(),
        this.checkMetricsCollection()
      ]);

      const timestamp = new Date().toISOString();
      await this.persistHealthChecks(results, timestamp);
      this.emit('healthCheckComplete', results);
    } catch (error) {
      ErrorLogger.error('Health check failed:', error as Error);
      this.emit('healthCheckError', error);
    }
  }

  private async checkAgentHealth(): Promise<HealthCheckResult> {
    const agents = AgentManager.getInstance().getAgents();
    const totalAgents = agents.length;
    let healthyAgents = 0;

    agents.forEach(agent => {
      if (agent.getStatus().isRunning) {
        healthyAgents++;
      }
    });

    const healthRatio = totalAgents > 0 ? healthyAgents / totalAgents : 0;
    const status = healthRatio >= 0.8 ? 'healthy' : healthRatio >= 0.5 ? 'degraded' : 'unhealthy';

    return {
      component: 'agents',
      status,
      errorRate: 1 - healthRatio,
      message: `${healthyAgents}/${totalAgents} agents running`,
      timestamp: new Date().toISOString()
    };
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { error } = await supabase
        .from('health_checks')
        .select('id')
        .limit(1);

      const latency = Date.now() - start;

      if (error) throw error;

      return {
        component: 'database',
        status: latency < 1000 ? 'healthy' : latency < 3000 ? 'degraded' : 'unhealthy',
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        component: 'database',
        status: 'unhealthy',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkMetricsCollection(): Promise<HealthCheckResult> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('id')
        .gt('timestamp', fiveMinutesAgo.toISOString())
        .limit(1);

      if (error) throw error;

      return {
        component: 'metrics_collection',
        status: data.length > 0 ? 'healthy' : 'degraded',
        message: data.length > 0 ? 'Metrics being collected' : 'No recent metrics',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        component: 'metrics_collection',
        status: 'unhealthy',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async persistHealthChecks(
    results: HealthCheckResult[],
    timestamp: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('health_checks')
        .insert(results.map(result => ({
          ...result,
          last_check: timestamp
        })));

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to persist health checks:', error as Error);
      throw error;
    }
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  onHealthCheckComplete(
    callback: (results: HealthCheckResult[]) => void
  ): () => void {
    this.on('healthCheckComplete', callback);
    return () => this.off('healthCheckComplete', callback);
  }

  onHealthCheckError(
    callback: (error: Error) => void
  ): () => void {
    this.on('healthCheckError', callback);
    return () => this.off('healthCheckError', callback);
  }
}

export const healthCheckManager = HealthCheckManager.getInstance(); 