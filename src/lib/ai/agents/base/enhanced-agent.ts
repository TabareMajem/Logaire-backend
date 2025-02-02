import { ErrorLogger } from '@/lib/errors/logger';
import { metricsService } from '@/services/metrics-service';
import { BaseAgent } from './base-agent';
import { LearningManager } from './learning-manager';
import { ModelSelector } from './model-selector';
import { PromptGenerator } from './prompt-generator';

export interface EnhancedAgentConfig {
  id: string;
  type: string;
  enabled: boolean;
  models: {
    primary: string;
    fallback: string[];
  };
  learningConfig: {
    enabled: boolean;
    feedbackThreshold: number;
    adaptationRate: number;
  };
  promptConfig: {
    templates: Record<string, string>;
    maxTokens: number;
    temperature: number;
  };
}

export class EnhancedAgent extends BaseAgent {
  protected modelSelector: ModelSelector;
  protected learningManager: LearningManager;
  protected promptGenerator: PromptGenerator;
  protected config: EnhancedAgentConfig;

  constructor(config: EnhancedAgentConfig) {
    super({
      id: config.id,
      type: config.type,
      enabled: config.enabled
    });

    this.config = config;
    this.modelSelector = new ModelSelector(config.models);
    this.learningManager = new LearningManager(config.learningConfig);
    this.promptGenerator = new PromptGenerator(config.promptConfig);
  }

  protected async processWithAI(
    input: any,
    context: Record<string, any> = {},
    templateKey: string
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // Generate optimized prompt
      const prompt = await this.promptGenerator.generate(templateKey, {
        ...context,
        input
      });

      // Select best model based on task and performance history
      const model = await this.modelSelector.selectModel({
        prompt,
        context,
        previousPerformance: await this.learningManager.getPerformanceMetrics()
      });

      // Process with selected model
      const result = await model.process(prompt, {
        maxTokens: this.config.promptConfig.maxTokens,
        temperature: this.config.promptConfig.temperature
      });

      // Record performance metrics
      await this.recordMetrics({
        model: model.name,
        processingTime: Date.now() - startTime,
        inputLength: JSON.stringify(input).length,
        outputLength: JSON.stringify(result).length,
        success: true
      });

      // Update learning data
      await this.learningManager.recordInteraction({
        model: model.name,
        prompt,
        result,
        metrics: {
          processingTime: Date.now() - startTime,
          success: true
        }
      });

      return result;
    } catch (error) {
      ErrorLogger.error(`AI processing failed in ${this.config.type}:`, error as Error);
      
      // Record failure metrics
      await this.recordMetrics({
        model: this.modelSelector.getCurrentModel().name,
        processingTime: Date.now() - startTime,
        error: (error as Error).message,
        success: false
      });

      throw error;
    }
  }

  private async recordMetrics(data: Record<string, any>): Promise<void> {
    await metricsService.insertMetrics([
      {
        type: `${this.config.type}_processing`,
        value: data.processingTime,
        metadata: {
          model: data.model,
          success: data.success,
          ...(data.error && { error: data.error }),
          inputLength: data.inputLength,
          outputLength: data.outputLength
        }
      }
    ]);
  }

  async adapt(): Promise<void> {
    if (!this.config.learningConfig.enabled) return;

    try {
      // Analyze recent performance
      const performance = await this.learningManager.getPerformanceMetrics();
      
      // Update model selection weights
      await this.modelSelector.updateWeights(performance);

      // Optimize prompts based on successful interactions
      await this.promptGenerator.optimize(
        await this.learningManager.getSuccessfulPrompts()
      );

      // Update learning parameters
      await this.learningManager.updateParameters({
        recentPerformance: performance,
        adaptationRate: this.config.learningConfig.adaptationRate
      });
    } catch (error) {
      ErrorLogger.error('Agent adaptation failed:', error as Error);
    }
  }

  async getPerformanceReport(): Promise<Record<string, any>> {
    return {
      modelPerformance: await this.modelSelector.getPerformanceStats(),
      learningMetrics: await this.learningManager.getPerformanceMetrics(),
      promptEffectiveness: await this.promptGenerator.getEffectivenessStats()
    };
  }
}