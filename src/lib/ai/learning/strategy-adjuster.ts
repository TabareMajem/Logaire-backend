import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { LearningInsights, StrategyUpdate } from './types';

export class StrategyAdjuster {
  private readonly supabase = supabase;

  async adjustStrategy(insights: LearningInsights): Promise<StrategyUpdate> {
    try {
      const currentStrategy = await this.getCurrentStrategy();
      const adjustments = this.calculateAdjustments(insights, currentStrategy);
      const update = this.generateStrategyUpdate(currentStrategy, adjustments);

      await this.validateUpdate(update);
      await this.applyUpdate(update);

      return update;
    } catch (error) {
      ErrorLogger.error('Failed to adjust strategy', error as Error);
      throw error;
    }
  }

  private async getCurrentStrategy(): Promise<Record<string, any>> {
    const { data, error } = await this.supabase
      .from('agent_strategies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  }

  private calculateAdjustments(
    insights: LearningInsights,
    currentStrategy: Record<string, any>
  ): Record<string, any> {
    const adjustments: Record<string, any> = {};

    // Adjust based on performance patterns
    insights.patterns.forEach(pattern => {
      if (pattern.score < 0.7) {
        adjustments[`${pattern.type}_threshold`] = this.calculateNewThreshold(
          currentStrategy[`${pattern.type}_threshold`],
          pattern.score
        );
      }
    });

    // Adjust based on trends
    Object.entries(insights.trends).forEach(([metric, trend]) => {
      if (trend < 0) {
        adjustments[`${metric}_weight`] = this.calculateNewWeight(
          currentStrategy[`${metric}_weight`],
          trend
        );
      }
    });

    return adjustments;
  }

  private calculateNewThreshold(current: number, score: number): number {
    const adjustment = (0.7 - score) * 0.1;
    return Math.max(0, Math.min(1, current - adjustment));
  }

  private calculateNewWeight(current: number, trend: number): number {
    const adjustment = Math.abs(trend) * 0.1;
    return Math.max(0, Math.min(1, current + adjustment));
  }

  private generateStrategyUpdate(
    currentStrategy: Record<string, any>,
    adjustments: Record<string, any>
  ): StrategyUpdate {
    const update: StrategyUpdate = {
      changes: [],
      timestamp: new Date(),
      confidence: this.calculateUpdateConfidence(adjustments)
    };

    for (const [key, newValue] of Object.entries(adjustments)) {
      update.changes.push({
        parameter: key,
        oldValue: currentStrategy[key],
        newValue,
        reason: this.generateChangeReason(key, currentStrategy[key], newValue)
      });
    }

    return update;
  }

  private calculateUpdateConfidence(adjustments: Record<string, any>): number {
    const numChanges = Object.keys(adjustments).length;
    return Math.max(0.5, 1 - (numChanges * 0.1));
  }

  private generateChangeReason(
    parameter: string,
    oldValue: any,
    newValue: any
  ): string {
    const change = ((newValue - oldValue) / oldValue) * 100;
    const direction = change > 0 ? 'increased' : 'decreased';
    
    return `${parameter} ${direction} by ${Math.abs(change).toFixed(1)}% based on performance analysis`;
  }

  private async validateUpdate(update: StrategyUpdate): Promise<void> {
    // Ensure no parameter exceeds bounds
    update.changes.forEach(change => {
      if (typeof change.newValue === 'number') {
        if (change.newValue < 0 || change.newValue > 1) {
          throw new Error(`Invalid parameter value for ${change.parameter}`);
        }
      }
    });

    // Ensure update confidence meets minimum threshold
    if (update.confidence < 0.5) {
      throw new Error('Update confidence too low');
    }
  }

  private async applyUpdate(update: StrategyUpdate): Promise<void> {
    const { error } = await this.supabase
      .from('agent_strategies')
      .insert({
        changes: update.changes,
        confidence: update.confidence,
        created_at: update.timestamp.toISOString()
      });

    if (error) throw error;
  }
}