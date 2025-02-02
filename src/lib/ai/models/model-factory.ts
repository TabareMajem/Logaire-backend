import { ErrorLogger } from '@/lib/errors/logger';
import { BaseModel, ModelConfig } from './base-model';
import { ClaudeModel } from './claude-model';
import { OpenAIModel } from './openai-model';
import { PaLMModel } from './palm-model';

export class ModelFactory {
  private static instance: ModelFactory;
  private models: Map<string, BaseModel> = new Map();

  private constructor() {}

  static getInstance(): ModelFactory {
    if (!this.instance) {
      this.instance = new ModelFactory();
    }
    return this.instance;
  }

  getModel(config: ModelConfig): BaseModel {
    const modelKey = `${config.model}-${JSON.stringify(config)}`;

    if (!this.models.has(modelKey)) {
      this.models.set(modelKey, this.createModel(config));
    }

    return this.models.get(modelKey)!;
  }

  private createModel(config: ModelConfig): BaseModel {
    try {
      if (config.model.startsWith('gpt')) {
        return new OpenAIModel(config);
      }
      
      if (config.model.startsWith('claude')) {
        return new ClaudeModel(config);
      }
      
      if (config.model.startsWith('palm')) {
        return new PaLMModel(config);
      }

      throw new Error(`Unsupported model: ${config.model}`);
    } catch (error) {
      ErrorLogger.error('Failed to create model:', error as Error);
      throw error;
    }
  }

  clearModels(): void {
    this.models.clear();
  }
}

export const modelFactory = ModelFactory.getInstance(); 