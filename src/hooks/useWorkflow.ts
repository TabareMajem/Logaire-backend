// src/hooks/useWorkflow.ts -->

import { Workflow } from '@/lib/ai/workflow/types';
import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useWorkflow(workflowId: string) {
  const queryClient = useQueryClient();

  const {
    data: workflow,
    isLoading,
    error
  } = useQuery<Workflow>({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { mutate: updateWorkflow } = useMutation({
    mutationFn: async (updates: Partial<Workflow>) => {
      const { error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['workflow', workflowId]});
    },
    onError: (error) => {
      ErrorLogger.error('Failed to update workflow:', error as Error);
    }
  });

  const { mutate: cancelWorkflow } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('workflows')
        .update({ status: 'cancelled' })
        .eq('id', workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['workflow', workflowId]});
    },
    onError: (error) => {
      ErrorLogger.error('Failed to cancel workflow:', error as Error);
    }
  });

  return {
    workflow,
    isLoading,
    error,
    updateWorkflow,
    cancelWorkflow
  };
} 

export function useWorkflows() {
  const {
    data: workflows,
    isLoading,
    error
  } = useQuery<Workflow[]>({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return {
    workflows: workflows || [],
    isLoading,
    error
  };
}