import { collaborationOrchestrator } from '@/lib/ai/collaboration/collaboration-orchestrator';
import { CollaborationMessage } from '@/lib/ai/collaboration/types';
import { ErrorLogger } from '@/lib/errors/logger';
import { collaborationMetricsService } from '@/services/collaboration-metrics-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Metric } from './useMetrics';

export function useCollaboration(workflowId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = (update: any) => {
      queryClient.invalidateQueries({queryKey: ['collaboration', workflowId]});
    };

    collaborationOrchestrator.on('ui_update', handleUpdate);

    return () => {
      collaborationOrchestrator.off('ui_update', handleUpdate);
    };
  }, [workflowId, queryClient]);

  const { data, error, isLoading } = useQuery({
    queryKey: ['collaboration', workflowId],
    queryFn: async () => {
      try {
        const status = collaborationOrchestrator.getCollaborationStatus(workflowId);
        const metrics = await queryClient.fetchQuery(
          {queryKey: ['collaboration-metrics', workflowId]},
          // () => fetchCollaborationMetrics(workflowId)
        );

        return {
          ...status,
          metrics,
          messages: []
        };
      } catch (error) {
        ErrorLogger.error('Error fetching collaboration data:', error as Error);
        throw error;
      }
    },
    refetchInterval: 5000
  });

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (message: Partial<CollaborationMessage>) => {
      await collaborationOrchestrator.broadcastToWorkflow(
        workflowId,
        message.from!,
        message.content
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['collaboration', workflowId]});
    }
  });

  const { mutate: assignTask } = useMutation({
    mutationFn: async ({ agentId, task }: { agentId: string; task: any }) => {
      await collaborationOrchestrator.initiateCollaboration(
        workflowId,
        agentId,
        [agentId],
        task
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['collaboration', workflowId]});
    }
  });

  return {
    data,
    activeAgents: data?.activeAgents || [],
    messages: data?.messages || [],
    metrics: { successRate: 0, history: [] },
    error,
    isLoading,
    sendMessage,
    assignTask
  };
}

async function fetchCollaborationMetrics(workflowId: string) {
  try {
    return await collaborationMetricsService.getMetrics(workflowId);
  } catch (error) {
    ErrorLogger.error('Error fetching collaboration metrics:', error as Error);
    return {
      successRate: 0,
      history: [],
      messageCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      activeCollaborations: 0
    };
  }
} 