import { ErrorLogger } from '@/lib/errors/logger';
import { ClaudeModel } from '../models/claude-model';
import { OpenAIModel } from '../models/openai-model';
import { PaLMModel } from '../models/palm-model';

export interface ModelConfig {
  type: 'gpt-4' | 'gpt-3.5-turbo' | 'text-davinci-003';
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

interface ModelSelection {
  prompt: string;
  context: Record<string, any>;
  previousPerformance?: Record<string, any>;
}

export class ModelSelector {
  private models: Map<string, any>;
  private weights: Map<string, number>;
  private currentModel: string;
  private config: ModelConfig;

  constructor(private readonly config: ModelConfig) {
    this.config = config;
    this.currentModel = config.primary;
    this.models = new Map();
    this.weights = new Map();
    
    this.initializeModels();
  }

  private initializeModels(): void {
    // Initialize all supported models
    const modelConfigs = [
      { name: 'gpt-4', class: OpenAIModel, config: { model: 'gpt-4' } },
      { name: 'gpt-3.5-turbo', class: OpenAIModel, config: { model: 'gpt-3.5-turbo' } },
      { name: 'claude-2', class: ClaudeModel, config: { model: 'claude-2' } },
      { name: 'palm-2', class: PaLMModel, config: { model: 'palm-2' } }
    ];

    modelConfigs.forEach(({ name, class: ModelClass, config }) => {
      try {
        this.models.set(name, new ModelClass(config));
        this.weights.set(name, name === this.config.primary ? 1.0 : 0.5);
      } catch (error) {
        ErrorLogger.error(`Failed to initialize model ${name}:`, error as Error);
      }
    });
  }

  async selectModel({ prompt, context, previousPerformance }: ModelSelection): Promise<any> {
    try {
      // If we have performance data, use it to influence selection
      if (previousPerformance) {
        const bestModel = this.selectBestModel(previousPerformance);
        if (bestModel) {
          this.currentModel = bestModel;
          return this.models.get(bestModel);
        }
      }

      // Fallback to primary model
      const model = this.models.get(this.currentModel);
      if (!model) {
        throw new Error(`Model ${this.currentModel} not initialized`);
      }

      return model;
    } catch (error) {
      ErrorLogger.error('Model selection failed:', error as Error);
      // Fallback to first available model
      for (const fallbackModel of this.config.fallback) {
        const model = this.models.get(fallbackModel);
        if (model) {
          this.currentModel = fallbackModel;
          return model;
        }
      }
      throw new Error('No available models');
    }
  }

  private selectBestModel(performance: Record<string, any>): string | null {
    let bestModel = null;
    let bestScore = -1;

    for (const [model, weight] of this.weights.entries()) {
      const modelPerf = performance[model] || {};
      const score = this.calculateModelScore(modelPerf, weight);
      
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }

    return bestModel;
  }

  private calculateModelScore(performance: Record<string, any>, weight: number): number {
    const {
      successRate = 0,
      averageLatency = 1000,
      costPerRequest = 0.01
    } = performance;

    // Normalize metrics
    const normalizedLatency = 1 / (1 + averageLatency / 1000); // Convert to 0-1 range
    const normalizedCost = 1 / (1 + costPerRequest * 100); // Convert to 0-1 range

    // Calculate weighted score
    return (
      weight * (
        0.5 * successRate +
        0.3 * normalizedLatency +
        0.2 * normalizedCost
      )
    );
  }

  async updateWeights(performance: Record<string, any>): Promise<void> {
    for (const [model, modelPerf] of Object.entries(performance)) {
      const currentWeight = this.weights.get(model) || 0.5;
      const perfScore = this.calculateModelScore(modelPerf, 1.0);
      
      // Update weight using exponential moving average
      const newWeight = 0.7 * currentWeight + 0.3 * perfScore;
      this.weights.set(model, newWeight);
    }
  }

  getCurrentModel(): any {
    return this.models.get(this.currentModel);
  }

  async getPerformanceStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [model, weight] of this.weights.entries()) {
      stats[model] = {
        weight,
        isActive: model === this.currentModel,
        isAvailable: this.models.has(model)
      };
    }

    return stats;
  }
}