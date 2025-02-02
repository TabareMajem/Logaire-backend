import { CollaborationMessage, CollaborationMetrics } from '@/lib/ai/collaboration/types';
import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface CollaborationData {
  activeCollaborations: number;
  messageSuccessRate: number;
  avgResponseTime: number;
  collaborationTrend: 'up' | 'down' | 'stable';
  successRateTrend: 'up' | 'down' | 'stable';
  responseTrend: 'up' | 'down' | 'stable';
  messageHistory: {
    timestamp: string;
    sent: number;
    received: number;
  }[];
  activeAgents: {
    id: string;
    name: string;
    type: string;
    status: string;
    currentLoad: number;
  }[];
  recentMessages: CollaborationMessage[];
}

export function useAgentCollaboration(workflowId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel(`collaboration-${workflowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_messages',
          filter: `workflow_id=eq.${workflowId}`
        },
        () => {
          queryClient.invalidateQueries({queryKey: ['collaboration', workflowId]});
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [workflowId, queryClient]);

  return useQuery<CollaborationData>({
    queryKey: ['collaboration', workflowId],
    queryFn: async () => {
      try {
        const [
          metrics,
          messages,
          agents
        ] = await Promise.all([
          fetchCollaborationMetrics(workflowId),
          fetchRecentMessages(workflowId),
          fetchActiveAgents(workflowId)
        ]);

        const history = await fetchMessageHistory(workflowId);

        return {
          activeCollaborations: metrics.activeCollaborations,
          messageSuccessRate: metrics.successRate,
          avgResponseTime: metrics.averageResponseTime,
          collaborationTrend: calculateTrend(history.map(h => h.sent + h.received)),
          successRateTrend: calculateTrend(history.map(h => h.successRate)),
          responseTrend: calculateTrend(history.map(h => h.responseTime)),
          messageHistory: history,
          activeAgents: agents,
          recentMessages: messages
        };
      } catch (error) {
        ErrorLogger.error('Error fetching collaboration data:', error as Error);
        throw error;
      }
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });
}

async function fetchCollaborationMetrics(
  workflowId: string
): Promise<CollaborationMetrics> {
  const { data, error } = await supabase
    .from('collaboration_metrics')
    .select('*')
    .eq('workflow_id', workflowId)
    .single();

  if (error) throw error;
  return data;
}

async function fetchRecentMessages(
  workflowId: string
): Promise<CollaborationMessage[]> {
  const { data, error } = await supabase
    .from('collaboration_messages')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

async function fetchActiveAgents(workflowId: string) {
  const { data, error } = await supabase
    .from('workflow_agents')
    .select('*')
    .eq('workflow_id', workflowId)
    .eq('status', 'active');

  if (error) throw error;
  return data;
}

async function fetchMessageHistory(workflowId: string) {
  const { data, error } = await supabase
    .from('collaboration_history')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('timestamp', { ascending: true })
    .limit(50);

  if (error) throw error;
  return data;
}

function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';

  const recent = values.slice(-5);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const last = recent[recent.length - 1];

  if (last > avg * 1.1) return 'up';
  if (last < avg * 0.9) return 'down';
  return 'stable';
} 