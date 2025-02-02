import { supabase } from '@/lib/supabase/client';
import { AgentType } from '../agents/base/agent-factory';
import { ErrorLogger } from '@/lib/errors/logger';

interface ScheduledTask {
  id: string;
  agentType: AgentType;
  taskType: string;
  input: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  scheduledFor: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export class TaskScheduler {
  private readonly supabase = supabase;

  async scheduleTask(params: {
    agentType: AgentType;
    taskType: string;
    input: Record<string, any>;
    scheduledFor: Date;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_tasks')
        .insert({
          agent_type: params.agentType,
          task_type: params.taskType,
          input: params.input,
          scheduled_for: params.scheduledFor.toISOString(),
          priority: params.priority || 'medium',
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      ErrorLogger.error('Failed to schedule task', error as Error);
      throw error;
    }
  }

  async getPendingTasks(): Promise<ScheduledTask[]> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_tasks')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get pending tasks', error as Error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: ScheduledTask['status'], error?: string): Promise<void> {
    try {
      const { error: updateError } = await this.supabase
        .from('scheduled_tasks')
        .update({
          status,
          error_message: error,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) throw updateError;
    } catch (error) {
      ErrorLogger.error('Failed to update task status', error as Error);
      throw error;
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('scheduled_tasks')
        .delete()
        .eq('id', taskId)
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to cancel task', error as Error);
      throw error;
    }
  }
}