import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

export interface CollaborationMetricsData {
  messageCount: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  activeCollaborations: number;
  history: {
    timestamp: string;
    responseTime: number;
    successRate: number;
    messageCount: number;
  }[];
}

export class CollaborationMetricsService {
  async getMetrics(workflowId: string): Promise<CollaborationMetricsData> {
    try {
      // Get current metrics
      const { data: currentMetrics, error: metricsError } = await supabase
        .from('collaboration_metrics')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (metricsError) throw metricsError;

      // Get historical data
      const { data: history, error: historyError } = await supabase
        .from('collaboration_metrics')
        .select('timestamp, average_response_time, success_rate, message_count')
        .eq('workflow_id', workflowId)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (historyError) throw historyError;

      return {
        messageCount: currentMetrics.message_count,
        averageResponseTime: currentMetrics.average_response_time,
        successRate: currentMetrics.success_rate,
        errorRate: currentMetrics.error_rate,
        activeCollaborations: currentMetrics.active_collaborations,
        history: history.map(h => ({
          timestamp: h.timestamp,
          responseTime: h.average_response_time,
          successRate: h.success_rate,
          messageCount: h.message_count
        }))
      };
    } catch (error) {
      ErrorLogger.error('Error fetching collaboration metrics:', error as Error);
      throw error;
    }
  }

  async recordMetrics(workflowId: string, metrics: Partial<CollaborationMetricsData>): Promise<void> {
    try {
      const { error } = await supabase
        .from('collaboration_metrics')
        .insert({
          workflow_id: workflowId,
          message_count: metrics.messageCount,
          average_response_time: metrics.averageResponseTime,
          success_rate: metrics.successRate,
          error_rate: metrics.errorRate,
          active_collaborations: metrics.activeCollaborations,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Error recording collaboration metrics:', error as Error);
      throw error;
    }
  }
}

export const collaborationMetricsService = new CollaborationMetricsService(); 