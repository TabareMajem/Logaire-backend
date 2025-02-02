import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { Feedback, LearningInsights, PerformancePattern } from './types';

export class FeedbackAnalyzer {
  private readonly supabase = supabase;

  async analyzeFeedback(feedback: Feedback[]): Promise<LearningInsights> {
    try {
      const patterns = await this.identifyPatterns(feedback);
      const trends = this.analyzeTrends(feedback);
      const improvements = this.generateImprovements(patterns, trends);

      const insights: LearningInsights = {
        patterns,
        trends,
        improvements,
        confidence: this.calculateConfidence(patterns),
        timestamp: new Date()
      };

      await this.storeInsights(insights);
      return insights;
    } catch (error) {
      ErrorLogger.error('Failed to analyze feedback', error as Error);
      throw error;
    }
  }

  private async identifyPatterns(feedback: Feedback[]): Promise<PerformancePattern[]> {
    const patterns: PerformancePattern[] = [];

    // Analyze success patterns
    patterns.push(...this.analyzeSuccessPatterns(feedback));

    // Analyze error patterns
    patterns.push(...this.analyzeErrorPatterns(feedback));

    // Analyze performance patterns
    patterns.push(...this.analyzePerformancePatterns(feedback));

    return patterns;
  }

  private analyzeSuccessPatterns(feedback: Feedback[]): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];
    const successfulExecutions = feedback.filter(f => 
      f.sources.outcome.aspects.success
    );

    if (successfulExecutions.length > 0) {
      const avgScore = successfulExecutions.reduce(
        (sum, f) => sum + f.aggregateScore,
        0
      ) / successfulExecutions.length;

      patterns.push({
        type: 'success',
        frequency: successfulExecutions.length / feedback.length,
        score: avgScore,
        factors: this.extractCommonFactors(successfulExecutions)
      });
    }

    return patterns;
  }

  private analyzeErrorPatterns(feedback: Feedback[]): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];
    const failedExecutions = feedback.filter(f => 
      !f.sources.outcome.aspects.success
    );

    if (failedExecutions.length > 0) {
      patterns.push({
        type: 'error',
        frequency: failedExecutions.length / feedback.length,
        score: this.calculateErrorImpact(failedExecutions),
        factors: this.extractCommonFactors(failedExecutions)
      });
    }

    return patterns;
  }

  private analyzePerformancePatterns(feedback: Feedback[]): PerformancePattern[] {
    return [
      this.analyzeLatencyPattern(feedback),
      // this.analyzeResourceUsagePattern(feedback),
      // this.analyzeQualityPattern(feedback)
    ];
  }

  private analyzeLatencyPattern(feedback: Feedback[]): PerformancePattern {
    const latencies = feedback.map(f => 
      f.sources.system.aspects.latency as number
    );

    return {
      type: 'latency',
      frequency: 1,
      score: this.calculatePerformanceScore(latencies),
      factors: this.identifyLatencyFactors(latencies)
    };
  }

  private calculateErrorImpact(executions: Feedback[]): number {
    return executions.reduce(
      (impact, f) => impact + (1 - f.aggregateScore),
      0
    ) / executions.length;
  }

  private extractCommonFactors(executions: Feedback[]): string[] {
    // Implementation for extracting common factors
    return [];
  }

  private calculatePerformanceScore(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    return 1 - (avg / max);
  }

  private identifyLatencyFactors(latencies: number[]): string[] {
    // Implementation for identifying latency factors
    return [];
  }

  private analyzeTrends(feedback: Feedback[]): Record<string, number> {
    const trends: Record<string, number> = {};
    
    // Sort feedback by timestamp
    const sortedFeedback = [...feedback].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate trends for different metrics
    trends.successRate = this.calculateTrend(
      sortedFeedback.map(f => f.sources.outcome.aspects.success ? 1 : 0)
    );
    trends.quality = this.calculateTrend(
      sortedFeedback.map(f => f.sources.outcome.aspects.quality as number)
    );
    trends.performance = this.calculateTrend(
      sortedFeedback.map(f => f.sources.system.score)
    );

    return trends;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const xMean = (values.length - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / values.length;

    const numerator = values.reduce((sum, y, x) => 
      sum + ((x - xMean) * (y - yMean)), 
      0
    );
    
    const denominator = values.reduce((sum, _, x) => 
      sum + Math.pow(x - xMean, 2), 
      0
    );

    return numerator / denominator;
  }

  private generateImprovements(
    patterns: PerformancePattern[],
    trends: Record<string, number>
  ): string[] {
    const improvements: string[] = [];

    // Add improvements based on patterns
    patterns.forEach(pattern => {
      if (pattern.score < 0.7) {
        improvements.push(
          `Improve ${pattern.type} performance (current score: ${pattern.score.toFixed(2)})`
        );
      }
    });

    // Add improvements based on trends
    Object.entries(trends).forEach(([metric, trend]) => {
      if (trend < 0) {
        improvements.push(
          `Address declining ${metric} trend (slope: ${trend.toFixed(2)})`
        );
      }
    });

    return improvements;
  }

  private calculateConfidence(patterns: PerformancePattern[]): number {
    if (patterns.length === 0) return 0;

    return patterns.reduce(
      (sum, pattern) => sum + (pattern.score * pattern.frequency),
      0
    ) / patterns.length;
  }

  private async storeInsights(insights: LearningInsights): Promise<void> {
    const { error } = await this.supabase
      .from('learning_insights')
      .insert({
        patterns: insights.patterns,
        trends: insights.trends,
        improvements: insights.improvements,
        confidence: insights.confidence,
        timestamp: insights.timestamp.toISOString()
      });

    if (error) throw error;
  }
}