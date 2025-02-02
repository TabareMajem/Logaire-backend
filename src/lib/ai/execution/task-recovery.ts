import { supabase } from '@/lib/supabase/client';
import { TaskExecutor } from './task-executor';
import { ErrorLogger } from '@/lib/errors/logger';
import { AIAgentContext } from '../types';

interface RecoveryStrategy {
  maxRetries: number;
  backoffMs: number;
  timeout: number;
  fallbackAction?: () => Promise<void>;
}

export class TaskRecovery {
  private readonly supabase = supabase;
  private readonly executor: TaskExecutor;

  constructor(context: AIAgentContext) {
    this.executor = new TaskExecutor(context);
  }

  async attemptRecovery(params: {
    taskId: string;
    error: Error;
    context: Record<string, any>;
    strategy?: Partial<RecoveryStrategy>;
  }): Promise<boolean> {
    try {
      // Get recovery strategy
      const strategy = await this.getRecoveryStrategy(params.error);

      // Apply custom strategy overrides
      const finalStrategy = {
        ...strategy,
        ...params.strategy
      };

      // Attempt recovery
      return await this.executeRecovery(params.taskId, finalStrategy);
    } catch (error) {
      ErrorLogger.error('Task recovery failed', error as Error);
      return false;
    }
  }

  private async getRecoveryStrategy(error: Error): Promise<RecoveryStrategy> {
    const { data, error: dbError } = await this.supabase
      .from('recovery_strategies')
      .select('*')
      .eq('error_type', error.name)
      .single();

    if (dbError) {
      return this.getDefaultStrategy();
    }

    return data;
  }

  private getDefaultStrategy(): RecoveryStrategy {
    return {
      maxRetries: 3,
      backoffMs: 1000,
      timeout: 30000
    };
  }

  private async executeRecovery(
    taskId: string,
    strategy: RecoveryStrategy
  ): Promise<boolean> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < strategy.maxRetries) {
      try {
        // Wait for backoff period
        await this.delay(strategy.backoffMs * Math.pow(2, attempts));

        // Attempt to re-execute task
        const task = await this.getTaskDetails(taskId);
        if (!task) throw new Error('Task not found');

        await this.executor.executeTask({
          agentType: task.agent_type,
          taskType: task.task_type,
          input: task.input
        });

        return true;
      } catch (error) {
        lastError = error as Error;
        attempts++;
      }
    }

    // If all retries failed and fallback exists, try it
    if (strategy.fallbackAction) {
      try {
        await strategy.fallbackAction();
        return true;
      } catch (error) {
        ErrorLogger.error('Fallback action failed', error as Error);
      }
    }

    // Record final failure
    await this.recordRecoveryFailure(taskId, lastError);
    return false;
  }

  private async getTaskDetails(taskId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  }

  private async recordRecoveryFailure(taskId: string, error: Error | null): Promise<void> {
    const { error: dbError } = await this.supabase
      .from('recovery_failures')
      .insert({
        task_id: taskId,
        error_message: error?.message,
        error_stack: error?.stack,
        failed_at: new Date().toISOString()
      });

    if (dbError) {
      ErrorLogger.error('Failed to record recovery failure', dbError);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}