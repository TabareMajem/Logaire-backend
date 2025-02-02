import { TaskExecutor } from './task-executor';
import { TaskMonitor } from './task-monitor';
import { TaskValidator } from './task-validator';
import { AIAgentContext, AIAgentResponse } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';
import { AgentType } from '../agents/base/agent-factory';

export class TaskRunner {
  private executor: TaskExecutor;
  private monitor: TaskMonitor;
  private validator: TaskValidator;

  constructor(context: AIAgentContext) {
    this.executor = new TaskExecutor(context);
    this.monitor = new TaskMonitor();
    this.validator = new TaskValidator();
  }

  async runTask<T extends string>(params: {
    agentType: AgentType;
    taskType: string;
    input: Record<string, any>;
    priority?: 'low' | 'medium' | 'high';
    scheduleFor?: Date;
  }): Promise<AIAgentResponse<T>> {
    const startTime = Date.now();

    try {
      // Validate task parameters
      this.validator.validateTask({
        agentType: params.agentType,
        taskType: params.taskType,
        input: params.input
      });

      // Execute task
      const result = await this.executor.executeTask<T>(params);

      // Record successful execution using the task ID directly
      await this.monitor.recordTaskExecution({
        taskId: result.data, // result.data is already the taskId since T extends string
        agentType: params.agentType,
        taskType: params.taskType,
        duration: Date.now() - startTime,
        success: true
      });

      return result;
    } catch (error) {
      // Record failed execution
      await this.monitor.recordTaskExecution({
        taskId: 'error',
        agentType: params.agentType,
        taskType: params.taskType,
        duration: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      });

      ErrorLogger.error('Task execution failed', error as Error);
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<{
    status: string;
    progress?: number;
    error?: string;
  }> {
    return this.monitor.getTaskStatus(taskId);
  }

  async getMetrics(timeframe?: number): Promise<{
    successRate: number;
    averageExecutionTime: number;
    totalTasks: number;
  }> {
    return this.monitor.getTaskMetrics(timeframe);
  }
}