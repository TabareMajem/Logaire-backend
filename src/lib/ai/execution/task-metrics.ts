import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface TaskMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  successRate: number;
  errorRate: number;
  throughput: number;
}

export class TaskMetricsCollector {
  private readonly supabase = supabase;

  async recordMetrics(params: {
    taskId: string;
    agentType: string;
    taskType: string;
    metrics: Partial<TaskMetrics>;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('task_metrics')
        .insert({
          task_id: params.taskId,
          agent_type: params.agentType,
          task_type: params.taskType,
          metrics: params.metrics,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record task metrics', error as Error);
    }
  }

  async getAggregatedMetrics(params: {
    agentType?: string;
    taskType?: string;
    timeframe?: number;
  }): Promise<TaskMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_aggregated_metrics', {
          p_agent_type: params.agentType,
          p_task_type: params.taskType,
          p_timeframe: params.timeframe || 3600
        });

      if (error) throw error;

      return {
        executionTime: data.avg_execution_time,
        memoryUsage: data.avg_memory_usage,
        cpuUsage: data.avg_cpu_usage,
        successRate: data.success_rate,
        errorRate: data.error_rate,
        throughput: data.throughput
      };
    } catch (error) {
      ErrorLogger.error('Failed to get aggregated metrics', error as Error);
      throw error;
    }
  }

  async getMetricsHistory(params: {
    agentType: string;
    taskType: string;
    timeframe: number;
  }): Promise<Array<TaskMetrics & { timestamp: Date }>> {
    try {
      const { data, error } = await this.supabase
        .from('task_metrics')
        .select('metrics, recorded_at')
        .eq('agent_type', params.agentType)
        .eq('task_type', params.taskType)
        .gte('recorded_at', new Date(Date.now() - params.timeframe * 1000).toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      return data.map(record => ({
        ...record.metrics,
        timestamp: new Date(record.recorded_at)
      }));
    } catch (error) {
      ErrorLogger.error('Failed to get metrics history', error as Error);
      throw error;
    }
  }
}