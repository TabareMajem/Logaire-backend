import { TaskQueue } from '../orchestration/task-queue';
import { TaskRunner } from './task-runner';
import { AIAgentContext } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class TaskQueueProcessor {
  private queue: TaskQueue;
  private runner: TaskRunner;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(context: AIAgentContext) {
    this.queue = new TaskQueue();
    this.runner = new TaskRunner(context);
  }

  async startProcessing(intervalMs: number = 1000): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processingInterval = setInterval(
      () => this.processNextTask(),
      intervalMs
    );
  }

  async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  private async processNextTask(): Promise<void> {
    try {
      const task = await this.queue.dequeue();
      if (!task) return;

      await this.runner.runTask({
        agentType: task.agentType,
        taskType: task.taskType,
        input: task.input,
        priority: this.getPriorityLevel(task.priority)
      });
    } catch (error) {
      ErrorLogger.error('Failed to process task from queue', error as Error);
    }
  }

  private getPriorityLevel(priority: number): 'low' | 'medium' | 'high' {
    if (priority >= 3) return 'high';
    if (priority >= 2) return 'medium';
    return 'low';
  }
}