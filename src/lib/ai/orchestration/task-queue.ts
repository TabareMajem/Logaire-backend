import { supabase } from '@/lib/supabase/client';
import { AgentType } from '../agents/base/agent-factory';
import { ErrorLogger } from '@/lib/errors/logger';

interface QueuedTask {
  id: string;
  agentType: AgentType;
  taskType: string;
  input: Record<string, any>;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export class TaskQueue {
  private readonly supabase = supabase;
  private readonly PRIORITY_LEVELS = {
    high: 3,
    medium: 2,
    low: 1
  };

  async enqueue(params: {
    agentType: AgentType;
    taskType: string;
    input: Record<string, any>;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('task_queue')
        .insert({
          agent_type: params.agentType,
          task_type: params.taskType,
          input: params.input,
          priority: this.PRIORITY_LEVELS[params.priority || 'medium'],
          status: 'queued',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      ErrorLogger.error('Failed to enqueue task', error as Error);
      throw error;
    }
  }

  async dequeue(): Promise<QueuedTask | null> {
    try {
      const { data, error } = await this.supabase.rpc('dequeue_task');

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to dequeue task', error as Error);
      throw error;
    }
  }

  async completeTask(taskId: string, result?: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('task_queue')
        .update({
          status: 'completed',
          result,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to complete task', error as Error);
      throw error;
    }
  }

  async failTask(taskId: string, error: Error): Promise<void> {
    try {
      const { error: updateError } = await this.supabase
        .from('task_queue')
        .update({
          status: 'failed',
          error_message: error.message,
          error_stack: error.stack,
          failed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) throw updateError;
    } catch (error) {
      ErrorLogger.error('Failed to mark task as failed', error as Error);
      throw error;
    }
  }
}