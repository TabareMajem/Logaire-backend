import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface TaskDependency {
  taskId: string;
  dependsOn: string[];
  status: 'pending' | 'completed' | 'failed';
}

export class TaskDependencyManager {
  private readonly supabase = supabase;

  async addDependencies(taskId: string, dependencies: string[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('task_dependencies')
        .insert({
          task_id: taskId,
          depends_on: dependencies,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to add task dependencies', error as Error);
      throw error;
    }
  }

  async checkDependencies(taskId: string): Promise<boolean> {
    try {
      const dependencies = await this.getDependencies(taskId);
      
      if (!dependencies.length) {
        return true;
      }

      const statuses = await this.getDependencyStatuses(dependencies);
      return statuses.every(status => status === 'completed');
    } catch (error) {
      ErrorLogger.error('Failed to check task dependencies', error as Error);
      throw error;
    }
  }

  private async getDependencies(taskId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('task_dependencies')
      .select('depends_on')
      .eq('task_id', taskId)
      .single();

    if (error) throw error;
    return data?.depends_on || [];
  }

  private async getDependencyStatuses(dependencies: string[]): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('status')
      .in('id', dependencies);

    if (error) throw error;
    return data.map(task => task.status);
  }
}