import { supabase } from '@/lib/supabase/client';
import { StrategyUpdate } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface OptimizationResult {
  parameter: string;
  currentValue: number;
  recommendedValue: number;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

export class StrategyOptimizer {
  private readonly supabase = supabase;

  async optimizeStrategy(
    currentStrategy: Record<string, number>,
    performance: Record<string, number>
  ): Promise<StrategyUpdate> {
    try {
      const optimizations = await this.generateOptimizations(
        currentStrategy,
        performance
      );

      const changes = optimizations.map(opt => ({
        parameter: opt.parameter,
        oldValue: opt.currentValue,
        newValue: opt.recommendedValue,
        reason: this.generateChangeReason(opt)
      }));

      return {
        changes,
        confidence: this.calculateOverallConfidence(optimizations),
        timestamp: new Date()
      };
    } catch (error) {
      ErrorLogger.error('Strategy optimization failed', error as Error);
      throw error;
    }
  }

  private async generateOptimizations(
    currentStrategy: Record<string, number>,
    performance: Record<string, number>
  ): Promise<OptimizationResult[]> {
    const optimizations: OptimizationResult[] = [];

    // Optimize confidence threshold
    if (performance.accuracy < 0.8) {
      optimizations.push({
        parameter: 'confidence_threshold',
        currentValue: currentStrategy.confidence_threshold || 0.7,
        recommendedValue: Math.min((currentStrategy.confidence_threshold || 0.7) + 0.1, 0.95),
        confidence: 0.8,
        impact: 'high'
      });
    }

    // Optimize batch size
    if (performance.latency > 2000) {
      optimizations.push({
        parameter: 'batch_size',
        currentValue: currentStrategy.batch_size || 10,
        recommendedValue: Math.max((currentStrategy.batch_size || 10) - 2, 1),
        confidence: 0.85,
        impact: 'medium'
      });
    }

    // Optimize resource limits
    if (performance.resourceUsage > 0.8) {
      optimizations.push({
        parameter: 'resource_limit',
        currentValue: currentStrategy.resource_limit || 1000,
        recommendedValue: Math.floor((currentStrategy.resource_limit || 1000) * 0.8),
        confidence: 0.75,
        impact: 'medium'
      });
    }

    return optimizations;
  }

  private generateChangeReason(optimization: OptimizationResult): string {
    const changePercent = Math.abs(
      (optimization.recommendedValue - optimization.currentValue) / 
      optimization.currentValue * 100
    ).toFixed(1);

    return `Adjusting ${optimization.parameter} by ${changePercent}% to improve performance (${optimization.impact} impact)`;
  }

  private calculateOverallConfidence(optimizations: OptimizationResult[]): number {
    if (optimizations.length === 0) return 0;

    const weightedConfidence = optimizations.reduce((sum, opt) => {
      const weight = opt.impact === 'high' ? 1 :
                    opt.impact === 'medium' ? 0.7 :
                    0.4;
      return sum + (opt.confidence * weight);
    }, 0);

    return weightedConfidence / optimizations.length;
  }
}