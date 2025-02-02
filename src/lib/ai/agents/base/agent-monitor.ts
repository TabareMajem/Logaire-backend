import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { AgentMetrics, AgentResult, AgentTask } from './types';

export class AgentMonitor {
  private readonly supabase = supabase;

  async startExecution(
    agentType: string,
    task: AgentTask
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('agent_executions')
        .insert({
          agent_type: agentType,
          task_type: task.type,
          status: 'running',
          started_at: new Date().toISOString(),
          task_data: task
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      ErrorLogger.error('Failed to start execution monitoring', error as Error);
      throw error;
    }
  }

  async completeExecution(
    executionId: string,
    result: AgentResult
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result,
          success: result.success,
          confidence: result.confidence
        })
        .eq('id', executionId);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to complete execution monitoring', error as Error);
      throw error;
    }
  }

  async failExecution(
    executionId: string,
    error: Error
  ): Promise<void> {
    try {
      const { error: dbError } = await this.supabase
        .from('agent_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: error.message,
          success: false
        })
        .eq('id', executionId);

      if (dbError) throw dbError;
    } catch (error) {
      ErrorLogger.error('Failed to record execution failure', error as Error);
      throw error;
    }
  }

  async getMetrics(agentType: string): Promise<AgentMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_agent_metrics', { agent_type_param: agentType });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get agent metrics', error as Error);
      throw error;
    }
  }

  async getActiveExecutions(): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.supabase
        .from('agent_executions')
        .select('agent_type, count')
        .eq('status', 'running')
        .group_by('agent_type');

      if (error) throw error;

      return data.reduce((acc, item) => ({
        ...acc,
        [item.agent_type]: item.count
      }), {});
    } catch (error) {
      ErrorLogger.error('Failed to get active executions', error as Error);
      throw error;
    }
  }
}