// src/lib/ai/execution/task-monitor.ts -->

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  successRate: number;
}

export class TaskMonitor {
  private readonly supabase = supabase;

  async recordTaskExecution(params: {
    taskId: string;
    agentType: string;
    taskType: string;
    duration: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('task_executions')
        .insert({
          task_id: params.taskId,
          agent_type: params.agentType,
          task_type: params.taskType,
          duration: params.duration,
          success: params.success,
          error_message: params.error,
          executed_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record task execution', error as Error);
    }
  }

  async getTaskMetrics(timeframe: number = 3600): Promise<TaskMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_task_metrics', {
          lookback_seconds: timeframe
        });

      if (error) throw error;

      return {
        totalTasks: data.total_tasks,
        completedTasks: data.completed_tasks,
        failedTasks: data.failed_tasks,
        averageExecutionTime: data.average_execution_time,
        successRate: data.success_rate
      };
    } catch (error) {
      ErrorLogger.error('Failed to get task metrics', error as Error);
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<{
    status: string;
    progress?: number;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('task_executions')
        .select('*')
        .eq('task_id', taskId)
        .single();

      if (error) throw error;

      return {
        status: data.status,
        progress: data.progress,
        error: data.error_message
      };
    } catch (error) {
      ErrorLogger.error('Failed to get task status', error as Error);
      throw error;
    }
  }
}