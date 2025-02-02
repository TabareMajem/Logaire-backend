import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

export interface TaskAssignment {
  id: string;
  workflowId: string;
  agentId: string;
  taskId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAt: string;
  completedAt?: string;
  result?: any;
}

export class TaskHandler {
  async assignTask(
    workflowId: string,
    agentId: string,
    task: any
  ): Promise<TaskAssignment> {
    try {
      const { data, error } = await supabase
        .from('agent_task_assignments')
        .insert({
          workflow_id: workflowId,
          agent_id: agentId,
          task_id: task.id,
          status: 'pending',
          assigned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Error assigning task:', error as Error);
      throw error;
    }
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskAssignment['status'],
    result?: any
  ): Promise<void> {
    try {
      const updates: Partial<TaskAssignment> = {
        status,
        ...(status === 'completed' && {
          completedAt: new Date().toISOString(),
          result
        })
      };

      const { error } = await supabase
        .from('agent_task_assignments')
        .update(updates)
        .eq('task_id', taskId);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Error updating task status:', error as Error);
      throw error;
    }
  }

  async getAgentTasks(agentId: string): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('agent_task_assignments')
        .select('*')
        .eq('agent_id', agentId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Error fetching agent tasks:', error as Error);
      throw error;
    }
  }
}

export const taskHandler = new TaskHandler(); 