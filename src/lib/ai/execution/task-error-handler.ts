import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface TaskError {
  taskId: string;
  errorType: string;
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: Date;
}

export class TaskErrorHandler {
  private readonly supabase = supabase;

  async handleError(error: Error, context: {
    taskId: string;
    agentType: string;
    taskType: string;
    input: Record<string, any>;
  }): Promise<void> {
    try {
      // Log error
      ErrorLogger.error('Task execution error', error, context);

      // Store error details
      await this.storeError({
        taskId: context.taskId,
        errorType: error.name,
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date()
      });

      // Analyze error patterns
      await this.analyzeErrorPatterns(context.agentType, context.taskType);
    } catch (handlingError) {
      ErrorLogger.error('Error handling failed', handlingError as Error);
    }
  }

  private async storeError(error: TaskError): Promise<void> {
    const { error: dbError } = await this.supabase
      .from('task_errors')
      .insert({
        task_id: error.taskId,
        error_type: error.errorType,
        message: error.message,
        stack_trace: error.stack,
        context: error.context,
        created_at: error.timestamp.toISOString()
      });

    if (dbError) throw dbError;
  }

  private async analyzeErrorPatterns(agentType: string, taskType: string): Promise<void> {
    const { data: errors, error } = await this.supabase
      .from('task_errors')
      .select('*')
      .eq('context->agentType', agentType)
      .eq('context->taskType', taskType)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const patterns = this.identifyErrorPatterns(errors);
    await this.updateErrorThresholds(agentType, taskType, patterns);
  }

  private identifyErrorPatterns(errors: any[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      const type = error.error_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  private async updateErrorThresholds(
    agentType: string,
    taskType: string,
    patterns: Record<string, number>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('error_thresholds')
      .upsert({
        agent_type: agentType,
        task_type: taskType,
        patterns,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}