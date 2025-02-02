import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface AgentMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  successRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export class MetricsCollector {
  private readonly supabase = supabase;

  async recordMetrics(params: {
    agentType: string;
    taskType: string;
    duration: number;
    success: boolean;
    memory: number;
    cpu: number;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_metrics')
        .insert({
          agent_type: params.agentType,
          task_type: params.taskType,
          duration: params.duration,
          success: params.success,
          memory_usage: params.memory,
          cpu_usage: params.cpu,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record agent metrics', error as Error);
    }
  }

  async getMetrics(agentType: string): Promise<AgentMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_agent_metrics', {
          agent_type_param: agentType,
          lookback_minutes: 60
        });

      if (error) throw error;

      // Assuming the data returned from the RPC is in the format needed
      return {
        requestCount: data.request_count,
        errorCount: data.error_count,
        averageLatency: data.average_latency,
        successRate: data.success_rate,
        memoryUsage: data.memory_usage, // Assuming the field exists in the response
        cpuUsage: data.cpu_usage        // Assuming the field exists in the response
      };
    } catch (error) {
      ErrorLogger.error('Failed to retrieve agent metrics', error as Error);
      throw error; // Rethrow to propagate the error if needed
    }
  }
}
