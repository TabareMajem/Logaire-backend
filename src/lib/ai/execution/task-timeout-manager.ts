import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface TimeoutConfig {
  duration: number;
  strategy: 'abort' | 'retry' | 'fallback';
  fallbackAction?: () => Promise<void>;
}

export class TaskTimeoutManager {
  private readonly supabase = supabase;
  private timeouts = new Map<string, NodeJS.Timeout>();

  async setTimeout(taskId: string, config: TimeoutConfig): Promise<void> {
    try {
      // Clear any existing timeout
      this.clearTimeout(taskId);

      // Set new timeout
      const timeout = setTimeout(async () => {
        await this.handleTimeout(taskId, config);
      }, config.duration);

      this.timeouts.set(taskId, timeout);

      // Record timeout configuration
      await this.recordTimeoutConfig(taskId, config);
    } catch (error) {
      ErrorLogger.error('Failed to set task timeout', error as Error);
      throw error;
    }
  }

  clearTimeout(taskId: string): void {
    const timeout = this.timeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(taskId);
    }
  }

  private async handleTimeout(taskId: string, config: TimeoutConfig): Promise<void> {
    try {
      switch (config.strategy) {
        case 'abort':
          await this.abortTask(taskId);
          break;
        case 'retry':
          await this.retryTask(taskId);
          break;
        case 'fallback':
          if (config.fallbackAction) {
            await config.fallbackAction();
          }
          break;
      }
    } catch (error) {
      ErrorLogger.error('Timeout handling failed', error as Error);
    }
  }

  private async recordTimeoutConfig(taskId: string, config: TimeoutConfig): Promise<void> {
    const { error } = await this.supabase
      .from('task_timeouts')
      .insert({
        task_id: taskId,
        duration: config.duration,
        strategy: config.strategy,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  private async abortTask(taskId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .update({
        status: 'aborted',
        error_message: 'Task timed out',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) throw error;
  }

  private async retryTask(taskId: string): Promise<void> {
    const { data: task, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;

    // Create new task with same parameters
    const { error: retryError } = await this.supabase
      .from('tasks')
      .insert({
        ...task,
        parent_task_id: taskId,
        retry_count: (task.retry_count || 0) + 1,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (retryError) throw retryError;
  }
}