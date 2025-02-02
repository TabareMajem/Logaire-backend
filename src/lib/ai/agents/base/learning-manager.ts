import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

interface LearningConfig {
  enabled: boolean;
  feedbackThreshold: number;
  adaptationRate: number;
}

interface Interaction {
  model: string;
  prompt: string;
  result: any;
  metrics: {
    processingTime: number;
    success: boolean;
    feedback?: number;
  };
}

interface PerformanceMetrics {
  successRate: number;
  averageLatency: number;
  costPerRequest: number;
  feedbackScore?: number;
}

export class LearningManager {
  private config: LearningConfig;
  private recentInteractions: Interaction[] = [];
  private performanceCache: Map<string, PerformanceMetrics> = new Map();
  private lastUpdateTime: number = 0;

  constructor(config: LearningConfig) {
    this.config = config;
  }

  async recordInteraction(interaction: Interaction): Promise<void> {
    try {
      // Store interaction in database
      const { error } = await supabase
        .from('agent_interactions')
        .insert([{
          model: interaction.model,
          prompt: interaction.prompt,
          result: interaction.result,
          processing_time: interaction.metrics.processingTime,
          success: interaction.metrics.success,
          feedback: interaction.metrics.feedback,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Update recent interactions cache
      this.recentInteractions.push(interaction);
      if (this.recentInteractions.length > 100) {
        this.recentInteractions.shift();
      }

      // Invalidate performance cache
      this.performanceCache.clear();
    } catch (error) {
      ErrorLogger.error('Failed to record interaction:', error as Error);
    }
  }

  async getPerformanceMetrics(): Promise<Record<string, PerformanceMetrics>> {
    const currentTime = Date.now();
    
    // Return cached metrics if recent
    if (currentTime - this.lastUpdateTime < 60000 && this.performanceCache.size > 0) {
      return Object.fromEntries(this.performanceCache);
    }

    try {
      // Fetch recent interactions from database
      const { data: interactions, error } = await supabase
        .from('agent_interactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculate metrics per model
      const metrics: Record<string, PerformanceMetrics> = {};
      
      for (const interaction of interactions) {
        if (!metrics[interaction.model]) {
          metrics[interaction.model] = {
            successRate: 0,
            averageLatency: 0,
            costPerRequest: this.calculateCost(interaction.model, interaction.processing_time),
            feedbackScore: 0
          };
        }

        const modelMetrics = metrics[interaction.model];
        const totalInteractions = interactions.filter(i => i.model === interaction.model).length;

        modelMetrics.successRate = interactions.filter(i => 
          i.model === interaction.model && i.success
        ).length / totalInteractions;

        modelMetrics.averageLatency = interactions
          .filter(i => i.model === interaction.model)
          .reduce((acc, i) => acc + i.processing_time, 0) / totalInteractions;

        if (interaction.feedback) {
          modelMetrics.feedbackScore = interactions
            .filter(i => i.model === interaction.model && i.feedback)
            .reduce((acc, i) => acc + (i.feedback || 0), 0) / totalInteractions;
        }
      }

      // Update cache
      this.performanceCache = new Map(Object.entries(metrics));
      this.lastUpdateTime = currentTime;

      return metrics;
    } catch (error) {
      ErrorLogger.error('Failed to get performance metrics:', error as Error);
      return {};
    }
  }

  async getSuccessfulPrompts(): Promise<Array<{ prompt: string; effectiveness: number }>> {
    try {
      const { data: interactions, error } = await supabase
        .from('agent_interactions')
        .select('*')
        .eq('success', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return interactions.map(interaction => ({
        prompt: interaction.prompt,
        effectiveness: this.calculatePromptEffectiveness(interaction)
      }));
    } catch (error) {
      ErrorLogger.error('Failed to get successful prompts:', error as Error);
      return [];
    }
  }

  private calculatePromptEffectiveness(interaction: any): number {
    const {
      processing_time,
      feedback = 0,
      result
    } = interaction;

    // Normalize processing time (lower is better)
    const timeScore = 1 / (1 + processing_time / 1000);

    // Consider result complexity/quality
    const resultComplexity = JSON.stringify(result).length / 1000;
    const qualityScore = Math.min(1, resultComplexity / 10);

    // Combine metrics with weights
    return (
      0.4 * timeScore +
      0.4 * (feedback / 5) + // Assuming feedback is 0-5
      0.2 * qualityScore
    );
  }

  private calculateCost(model: string, processingTime: number): number {
    // Simplified cost calculation based on model and processing time
    const baseCosts: Record<string, number> = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'claude-2': 0.015,
      'palm-2': 0.005
    };

    return (baseCosts[model] || 0.01) * (processingTime / 1000);
  }

  async updateParameters(params: {
    recentPerformance: Record<string, PerformanceMetrics>;
    adaptationRate: number;
  }): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const { recentPerformance, adaptationRate } = params;
      
      // Update feedback threshold based on performance
      const averageSuccess = Object.values(recentPerformance)
        .reduce((acc, metrics) => acc + metrics.successRate, 0) / 
        Object.keys(recentPerformance).length;

      this.config.feedbackThreshold = 
        this.config.feedbackThreshold * (1 - adaptationRate) +
        averageSuccess * adaptationRate;

      // Store updated configuration
      await supabase
        .from('agent_configs')
        .update({
          learning_config: this.config
        })
        .eq('type', 'learning_manager');

    } catch (error) {
      ErrorLogger.error('Failed to update learning parameters:', error as Error);
    }
  }
}