import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { AgentExecution, Feedback, FeedbackSource } from './types';

export class FeedbackCollector {
  private readonly supabase = supabase;

  async collectFeedback(execution: AgentExecution): Promise<Feedback> {
    try {
      const [userFeedback, systemMetrics, outcomeAnalysis] = await Promise.all([
        this.getUserFeedback(execution),
        this.measurePerformance(execution),
        this.analyzeOutcome(execution)
      ]);

      const feedback: Feedback = {
        executionId: execution.id,
        timestamp: new Date(),
        sources: {
          user: userFeedback,
          system: systemMetrics,
          outcome: outcomeAnalysis
        },
        aggregateScore: this.calculateAggregateScore({
          userFeedback,
          systemMetrics,
          outcomeAnalysis
        })
      };

      await this.storeFeedback(feedback);
      return feedback;
    } catch (error) {
      ErrorLogger.error('Failed to collect feedback', error as Error);
      throw error;
    }
  }

  private async getUserFeedback(execution: AgentExecution): Promise<FeedbackSource> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .eq('execution_id', execution.id)
      .single();

    if (error) throw error;

    return {
      score: data.score,
      aspects: data.aspects,
      comments: data.comments
    };
  }

  private async measurePerformance(execution: AgentExecution): Promise<FeedbackSource> {
    return {
      score: this.calculatePerformanceScore(execution),
      aspects: {
        latency: execution.duration,
        resourceUsage: execution.resourceUsage,
        accuracy: execution.accuracy
      }
    };
  }

  private async analyzeOutcome(execution: AgentExecution): Promise<FeedbackSource> {
    return {
      score: this.evaluateOutcome(execution),
      aspects: {
        success: execution.success,
        quality: execution.quality,
        impact: execution.impact
      }
    };
  }

  private calculatePerformanceScore(execution: AgentExecution): number {
    const weights = {
      latency: 0.3,
      resourceUsage: 0.3,
      accuracy: 0.4
    };

    const normalizedLatency = Math.min(1, 5000 / execution.duration);
    const normalizedResourceUsage = Math.min(1, 512 / execution.resourceUsage);

    return (
      normalizedLatency * weights.latency +
      normalizedResourceUsage * weights.resourceUsage +
      execution.accuracy * weights.accuracy
    );
  }

  private evaluateOutcome(execution: AgentExecution): number {
    const weights = {
      success: 0.4,
      quality: 0.3,
      impact: 0.3
    };

    return (
      (execution.success ? 1 : 0) * weights.success +
      execution.quality * weights.quality +
      execution.impact * weights.impact
    );
  }

  private calculateAggregateScore(feedback: Record<string, FeedbackSource>): number {
    const weights = {
      user: 0.4,
      system: 0.3,
      outcome: 0.3
    };

    return Object.entries(feedback).reduce(
      (total, [source, data]) => total + (data.score * weights[source as keyof typeof weights]),
      0
    );
  }

  private async storeFeedback(feedback: Feedback): Promise<void> {
    const { error } = await this.supabase
      .from('agent_feedback')
      .insert({
        execution_id: feedback.executionId,
        sources: feedback.sources,
        aggregate_score: feedback.aggregateScore,
        timestamp: feedback.timestamp.toISOString()
      });

    if (error) throw error;
  }
}