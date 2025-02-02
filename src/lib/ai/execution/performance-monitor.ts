import { supabase } from '@/lib/supabase/client';
import { AgentType } from '../agents/base/agent-factory';
import { ErrorLogger } from '@/lib/errors/logger';

interface PerformanceAlert {
  type: 'latency' | 'error_rate' | 'resource_usage';
  severity: 'low' | 'medium' | 'high';
  message: string;
  metadata: Record<string, any>;
}

export class PerformanceMonitor {
  private readonly supabase = supabase;
  
  private readonly thresholds = {
    latency: {
      warning: 2000, // 2 seconds
      critical: 5000 // 5 seconds
    },
    errorRate: {
      warning: 0.05, // 5%
      critical: 0.10 // 10%
    },
    resourceUsage: {
      warning: 0.8, // 80%
      critical: 0.9 // 90%
    }
  };

  async monitorPerformance(agentType: AgentType): Promise<{
    metrics: {
      latency: number;
      errorRate: number;
      resourceUsage: number;
      throughput: number;
    };
    alerts: PerformanceAlert[];
  }> {
    try {
      const metrics = await this.collectMetrics(agentType);
      const alerts = await this.checkThresholds(metrics);

      // Store monitoring results
      await this.storeMonitoringResults(agentType, metrics, alerts);

      return { metrics, alerts };
    } catch (error) {
      ErrorLogger.error('Performance monitoring failed', error as Error);
      throw error;
    }
  }

  private async collectMetrics(agentType: AgentType): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_agent_performance_metrics', {
        agent_type: agentType,
        lookback_minutes: 5
      });

    if (error) throw error;
    return data;
  }

  private async checkThresholds(metrics: any): Promise<PerformanceAlert[]> {
    const alerts: PerformanceAlert[] = [];

    // Check latency
    if (metrics.latency > this.thresholds.latency.critical) {
      alerts.push({
        type: 'latency',
        severity: 'high',
        message: 'Critical latency detected',
        metadata: { value: metrics.latency }
      });
    } else if (metrics.latency > this.thresholds.latency.warning) {
      alerts.push({
        type: 'latency',
        severity: 'medium',
        message: 'High latency detected',
        metadata: { value: metrics.latency }
      });
    }

    // Check error rate
    if (metrics.errorRate > this.thresholds.errorRate.critical) {
      alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: 'Critical error rate detected',
        metadata: { value: metrics.errorRate }
      });
    } else if (metrics.errorRate > this.thresholds.errorRate.warning) {
      alerts.push({
        type: 'error_rate',
        severity: 'medium',
        message: 'High error rate detected',
        metadata: { value: metrics.errorRate }
      });
    }

    // Check resource usage
    if (metrics.resourceUsage > this.thresholds.resourceUsage.critical) {
      alerts.push({
        type: 'resource_usage',
        severity: 'high',
        message: 'Critical resource usage detected',
        metadata: { value: metrics.resourceUsage }
      });
    } else if (metrics.resourceUsage > this.thresholds.resourceUsage.warning) {
      alerts.push({
        type: 'resource_usage',
        severity: 'medium',
        message: 'High resource usage detected',
        metadata: { value: metrics.resourceUsage }
      });
    }

    return alerts;
  }

  private async storeMonitoringResults(
    agentType: AgentType,
    metrics: any,
    alerts: PerformanceAlert[]
  ): Promise<void> {
    const { error } = await this.supabase
      .from('performance_monitoring')
      .insert({
        agent_type: agentType,
        metrics,
        alerts,
        monitored_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getPerformanceHistory(
    agentType: AgentType,
    timeframe: number = 24 * 3600
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('performance_monitoring')
      .select('*')
      .eq('agent_type', agentType)
      .gte('monitored_at', new Date(Date.now() - timeframe * 1000).toISOString())
      .order('monitored_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}