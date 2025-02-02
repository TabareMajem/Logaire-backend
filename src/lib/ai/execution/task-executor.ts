// src/lib/ai/execution/task-executor.ts -->

import { AgentCoordinator } from '../orchestration/agent-coordinator';
import { TaskQueue } from '../orchestration/task-queue';
import { TaskScheduler } from '../orchestration/task-scheduler';
import { AIAgentContext, AIAgentResponse } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';
import { AgentType } from '../agents/base/agent-factory';

export class TaskExecutor {
  private coordinator: AgentCoordinator;
  private queue: TaskQueue;
  private scheduler: TaskScheduler;

  constructor(context: AIAgentContext) {
    this.coordinator = new AgentCoordinator(context);
    this.queue = new TaskQueue();
    this.scheduler = new TaskScheduler();
  }

  async executeTask<T extends string>(params: {
    agentType: AgentType;
    taskType: string;
    input: Record<string, any>;
    priority?: 'low' | 'medium' | 'high';
    scheduleFor?: Date;
  }): Promise<AIAgentResponse<T>> {
    try {
      // If scheduled for future, add to scheduler
      if (params.scheduleFor && params.scheduleFor > new Date()) {
        const taskId = await this.scheduler.scheduleTask({
          agentType: params.agentType,
          taskType: params.taskType,
          input: params.input,
          scheduledFor: params.scheduleFor,
          priority: params.priority
        });
        
        return {
          data: taskId as T,
          confidence: 1,
          reasoning: ['Task scheduled successfully']
        };
      }

      // Add to queue for immediate execution
      const taskId = await this.queue.enqueue({
        agentType: params.agentType,
        taskType: params.taskType,
        input: params.input,
        priority: params.priority
      });

      // Execute task
      const result = await this.coordinator.executeAgentTask<T>({
        agentType: params.agentType,
        taskType: params.taskType,
        input: params.input,
        priority: params.priority
      });

      // Mark task as completed
      await this.queue.completeTask(taskId, result);

      return result;
    } catch (error) {
      ErrorLogger.error('Task execution failed', error as Error);
      throw error;
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    try {
      await this.scheduler.cancelTask(taskId);
    } catch (error) {
      ErrorLogger.error('Failed to cancel task', error as Error);
      throw error;
    }
  }
}