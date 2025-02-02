import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { metricsService } from '@/services/metrics-service';
import { CollaborationMessage, CollaborationMetrics } from './types';

export class CollaborationMetricsCollector {
  private static instance: CollaborationMetricsCollector;
  private messageBuffer: Map<string, CollaborationMessage[]>;
  private metricsInterval: NodeJS.Timer | null;
  private readonly BUFFER_SIZE = 100;
  private readonly METRICS_INTERVAL = 60000; // 1 minute

  private constructor() {
    this.messageBuffer = new Map();
    this.metricsInterval = null;
    this.startMetricsCollection();
  }

  static getInstance(): CollaborationMetricsCollector {
    if (!this.instance) {
      this.instance = new CollaborationMetricsCollector();
    }
    return this.instance;
  }

  trackMessage(workflowId: string, message: CollaborationMessage): void {
    try {
      let messages = this.messageBuffer.get(workflowId) || [];
      messages.push(message);

      // Keep buffer size in check
      if (messages.length > this.BUFFER_SIZE) {
        messages = messages.slice(-this.BUFFER_SIZE);
      }

      this.messageBuffer.set(workflowId, messages);
    } catch (error) {
      ErrorLogger.error('Error tracking message:', error as Error);
    }
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(
      () => this.processMetrics(),
      this.METRICS_INTERVAL
    );
  }

  private async processMetrics(): Promise<void> {
    try {
      const workflowIds = Array.from(this.messageBuffer.keys());
      
      for (const workflowId of workflowIds) {
        const messages = this.messageBuffer.get(workflowId) || [];
        if (messages.length === 0) continue;

        const metrics = this.calculateMetrics(messages);
        await this.storeMetrics(workflowId, metrics);

        // Clear processed messages
        this.messageBuffer.set(workflowId, []);
      }
    } catch (error) {
      ErrorLogger.error('Error processing metrics:', error as Error);
    }
  }

  private calculateMetrics(messages: CollaborationMessage[]): CollaborationMetrics {
    const now = Date.now();
    const recentMessages = messages.filter(
      m => now - new Date(m.metadata.timestamp).getTime() < this.METRICS_INTERVAL
    );

    const responseTimePairs = this.findRequestResponsePairs(recentMessages);
    const responseTimes = responseTimePairs.map(
      ([req, res]) => new Date(res.metadata.timestamp).getTime() - 
                      new Date(req.metadata.timestamp).getTime()
    );

    const errorMessages = recentMessages.filter(m => m.type === 'error');

    return {
      messageCount: recentMessages.length,
      averageResponseTime: this.calculateAverage(responseTimes),
      successRate: 1 - (errorMessages.length / recentMessages.length),
      errorRate: errorMessages.length / recentMessages.length,
      activeCollaborations: this.countActiveCollaborations(recentMessages)
    };
  }

  private findRequestResponsePairs(
    messages: CollaborationMessage[]
  ): [CollaborationMessage, CollaborationMessage][] {
    const pairs: [CollaborationMessage, CollaborationMessage][] = [];
    const requests = new Map<string, CollaborationMessage>();

    messages.forEach(message => {
      if (message.type === 'request') {
        requests.set(message.metadata.correlationId!, message);
      } else if (message.type === 'response' && message.metadata.correlationId) {
        const request = requests.get(message.metadata.correlationId);
        if (request) {
          pairs.push([request, message]);
          requests.delete(message.metadata.correlationId);
        }
      }
    });

    return pairs;
  }

  private countActiveCollaborations(messages: CollaborationMessage[]): number {
    const uniquePairs = new Set<string>();
    
    messages.forEach(message => {
      if (message.to) {
        const pair = [message.from, message.to].sort().join(':');
        uniquePairs.add(pair);
      }
    });

    return uniquePairs.size;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private async storeMetrics(
    workflowId: string,
    metrics: CollaborationMetrics
  ): Promise<void> {
    try {
      // Store in database
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

      // Record in metrics service
      await metricsService.insertMetrics([
        {
          type: 'collaboration_performance',
          workflowId,
          value: metrics.averageResponseTime,
          metadata: {
            messageCount: metrics.messageCount,
            successRate: metrics.successRate,
            activeCollaborations: metrics.activeCollaborations
          }
        }
      ]);
    } catch (error) {
      ErrorLogger.error('Error storing collaboration metrics:', error as Error);
    }
  }

  stopCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  clearBuffer(): void {
    this.messageBuffer.clear();
  }
}

export const collaborationMetricsCollector = CollaborationMetricsCollector.getInstance(); 