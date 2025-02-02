import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface LoadBalancerMetrics {
  activeWorkers: number;
  queueLength: number;
  averageLatency: number;
  throughput: number;
}

export class TaskLoadBalancer {
  private readonly supabase = supabase;
  private readonly maxConcurrentTasks = 10;
  private activeTasks = new Map<string, Promise<any>>();

  async scheduleTask<T>(task: {
    id: string;
    priority: number;
    execute: () => Promise<T>;
  }): Promise<T> {
    try {
      // Check current load
      await this.checkCapacity();

      // Add task to active tasks
      const taskPromise = this.executeWithLoadBalancing(task);
      this.activeTasks.set(task.id, taskPromise);

      // Clean up after task completes
      taskPromise.finally(() => {
        this.activeTasks.delete(task.id);
      });

      return taskPromise;
    } catch (error) {
      ErrorLogger.error('Task scheduling failed', error as Error);
      throw error;
    }
  }

  private async checkCapacity(): Promise<void> {
    if (this.activeTasks.size >= this.maxConcurrentTasks) {
      throw new Error('Maximum concurrent tasks reached');
    }
  }

  private async executeWithLoadBalancing<T>(task: {
    id: string;
    priority: number;
    execute: () => Promise<T>;
  }): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await task.execute();

      // Record metrics
      await this.recordMetrics({
        taskId: task.id,
        duration: Date.now() - startTime,
        success: true
      });

      return result;
    } catch (error) {
      // Record failure metrics
      await this.recordMetrics({
        taskId: task.id,
        duration: Date.now() - startTime,
        success: false,
        error: error as Error
      });

      throw error;
    }
  }

  private async recordMetrics(params: {
    taskId: string;
    duration: number;
    success: boolean;
    error?: Error;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('load_balancer_metrics')
        .insert({
          task_id: params.taskId,
          duration: params.duration,
          success: params.success,
          error_message: params.error?.message,
          active_tasks: this.activeTasks.size,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to record load balancer metrics', error as Error);
    }
  }

  async getMetrics(): Promise<LoadBalancerMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_load_balancer_metrics');

      if (error) throw error;

      return {
        activeWorkers: this.activeTasks.size,
        queueLength: data.queue_length,
        averageLatency: data.average_latency,
        throughput: data.throughput
      };
    } catch (error) {
      ErrorLogger.error('Failed to get load balancer metrics', error as Error);
      throw error;
    }
  }
}