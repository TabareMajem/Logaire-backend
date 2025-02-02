// src/hooks/useWorkflowMetrics.ts -->

import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useWorkflowMetrics(workflowId: string) {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['workflow-metrics', workflowId],
    queryFn: async () => {
      const [
        stepDurations,
        agentPerformance,
        resourceUsage,
        errorMetrics
      ] = await Promise.all([
        fetchStepDurations(workflowId),
        fetchAgentPerformance(workflowId),
        fetchResourceUsage(workflowId),
        fetchErrorMetrics(workflowId)
      ]);

      const workflow = await fetchWorkflowSummary(workflowId);

      return {
        totalDuration: calculateTotalDuration(workflow),
        successRate: calculateSuccessRate(workflow),
        completedSteps: countCompletedSteps(workflow),
        totalSteps: workflow.steps.length,
        averageStepDuration: calculateAverageStepDuration(stepDurations),
        stepDurations,
        agentPerformance,
        resourceUsage,
        errorMetrics
      };
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  return { metrics, isLoading, error };
}

async function fetchStepDurations(workflowId: string) {
  const { data, error } = await supabase
    .from('workflow_steps')
    .select('id, start_time, end_time')
    .eq('workflow_id', workflowId);

  if (error) {
    ErrorLogger.error('Failed to fetch step durations:', error);
    throw error;
  }

  return data.map(step => ({
    name: step.id,
    duration: step.end_time && step.start_time
      ? new Date(step.end_time).getTime() - new Date(step.start_time).getTime()
      : 0
  }));
}

async function fetchAgentPerformance(workflowId: string) {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('timestamp', { ascending: true });

  if (error) {
    ErrorLogger.error('Failed to fetch agent performance:', error);
    throw error;
  }

  return data.map(metric => ({
    timestamp: metric.timestamp,
    responseTime: metric.response_time,
    successRate: metric.success_rate
  }));
}

async function fetchResourceUsage(workflowId: string) {
  const { data, error } = await supabase
    .from('resource_metrics')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('timestamp', { ascending: true });

  if (error) {
    ErrorLogger.error('Failed to fetch resource usage:', error);
    throw error;
  }

  return data.map(metric => ({
    timestamp: metric.timestamp,
    cpu: metric.cpu_usage,
    memory: metric.memory_usage
  }));
}

async function fetchErrorMetrics(workflowId: string) {
  const { data, error } = await supabase
    .from('workflow_errors')
    .select('*')
    .eq('workflow_id', workflowId);

  if (error) {
    ErrorLogger.error('Failed to fetch error metrics:', error);
    throw error;
  }

  return data;
}

async function fetchWorkflowSummary(workflowId: string) {
  const { data, error } = await supabase
    .from('workflows')
    .select(`
      *,
      steps:workflow_steps(*)
    `)
    .eq('id', workflowId)
    .single();

  if (error) {
    ErrorLogger.error('Failed to fetch workflow summary:', error);
    throw error;
  }

  return data;
}

function calculateTotalDuration(workflow: any): number {
  if (!workflow.start_time) return 0;
  const end = workflow.end_time ? new Date(workflow.end_time) : new Date();
  return end.getTime() - new Date(workflow.start_time).getTime();
}

function calculateSuccessRate(workflow: any): number {
  const completedSteps = workflow.steps.filter(
    (step: any) => step.status === 'completed'
  ).length;
  return workflow.steps.length > 0
    ? completedSteps / workflow.steps.length
    : 0;
}

function countCompletedSteps(workflow: any): number {
  return workflow.steps.filter(
    (step: any) => step.status === 'completed'
  ).length;
}

function calculateAverageStepDuration(stepDurations: any[]): number {
  if (stepDurations.length === 0) return 0;
  const total = stepDurations.reduce((sum, step) => sum + step.duration, 0);
  return total / stepDurations.length;
} 