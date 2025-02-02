import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { Workflow, WorkflowStep } from './types';

export class WorkflowStorage {
  async saveWorkflow(workflow: Workflow): Promise<void> {
    try {
      const { error: workflowError } = await supabase
        .from('workflows')
        .insert({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          status: workflow.status,
          context: workflow.context,
          result: workflow.result,
          error: workflow.error,
          start_time: workflow.startTime,
          end_time: workflow.endTime,
          metadata: workflow.metadata
        });

      if (workflowError) throw workflowError;

      // Save workflow steps
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(
          workflow.steps.map(step => ({
            id: step.id,
            workflow_id: workflow.id,
            agent_id: step.agentId,
            dependencies: step.dependencies,
            input: step.input,
            output: step.output,
            status: step.status,
            error: step.error,
            start_time: step.startTime,
            end_time: step.endTime,
            retry_count: step.retryCount,
            max_retries: step.maxRetries
          }))
        );

      if (stepsError) throw stepsError;
    } catch (error) {
      ErrorLogger.error('Failed to save workflow:', error as Error);
      throw error;
    }
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    try {
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (workflowError) throw workflowError;
      if (!workflowData) return null;

      const { data: stepsData, error: stepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', id)
        .order('created_at', { ascending: true });

      if (stepsError) throw stepsError;

      return {
        id: workflowData.id,
        name: workflowData.name,
        description: workflowData.description,
        status: workflowData.status,
        steps: stepsData.map(this.mapStepFromDB),
        context: workflowData.context,
        result: workflowData.result,
        error: workflowData.error,
        startTime: workflowData.start_time,
        endTime: workflowData.end_time,
        metadata: workflowData.metadata
      };
    } catch (error) {
      ErrorLogger.error('Failed to get workflow:', error as Error);
      throw error;
    }
  }

  async updateWorkflow(workflow: Workflow): Promise<void> {
    try {
      const { error: workflowError } = await supabase
        .from('workflows')
        .update({
          status: workflow.status,
          result: workflow.result,
          error: workflow.error,
          end_time: workflow.endTime,
          metadata: workflow.metadata
        })
        .eq('id', workflow.id);

      if (workflowError) throw workflowError;

      // Update steps
      for (const step of workflow.steps) {
        const { error: stepError } = await supabase
          .from('workflow_steps')
          .update({
            status: step.status,
            output: step.output,
            error: step.error,
            end_time: step.endTime,
            retry_count: step.retryCount
          })
          .eq('id', step.id)
          .eq('workflow_id', workflow.id);

        if (stepError) throw stepError;
      }
    } catch (error) {
      ErrorLogger.error('Failed to update workflow:', error as Error);
      throw error;
    }
  }

  async listWorkflows(filters?: {
    status?: string[];
    from?: string;
    to?: string;
  }): Promise<Workflow[]> {
    try {
      let query = supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.in('status', filters.status);
      }

      if (filters?.from) {
        query = query.gte('created_at', filters.from);
      }

      if (filters?.to) {
        query = query.lte('created_at', filters.to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return Promise.all(
        data.map(async workflowData => {
          const { data: stepsData, error: stepsError } = await supabase
            .from('workflow_steps')
            .select('*')
            .eq('workflow_id', workflowData.id)
            .order('created_at', { ascending: true });

          if (stepsError) throw stepsError;

          return {
            id: workflowData.id,
            name: workflowData.name,
            description: workflowData.description,
            status: workflowData.status,
            steps: stepsData.map(this.mapStepFromDB),
            context: workflowData.context,
            result: workflowData.result,
            error: workflowData.error,
            startTime: workflowData.start_time,
            endTime: workflowData.end_time,
            metadata: workflowData.metadata
          };
        })
      );
    } catch (error) {
      ErrorLogger.error('Failed to list workflows:', error as Error);
      throw error;
    }
  }

  private mapStepFromDB(stepData: any): WorkflowStep {
    return {
      id: stepData.id,
      agentId: stepData.agent_id,
      dependencies: stepData.dependencies,
      input: stepData.input,
      output: stepData.output,
      status: stepData.status,
      error: stepData.error,
      startTime: stepData.start_time,
      endTime: stepData.end_time,
      retryCount: stepData.retry_count,
      maxRetries: stepData.max_retries
    };
  }

  async deleteWorkflow(id: string): Promise<void> {
    try {
      // Delete steps first due to foreign key constraint
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', id);

      if (stepsError) throw stepsError;

      const { error: workflowError } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (workflowError) throw workflowError;
    } catch (error) {
      ErrorLogger.error('Failed to delete workflow:', error as Error);
      throw error;
    }
  }
} 