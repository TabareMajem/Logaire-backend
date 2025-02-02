import { ErrorLogger } from '@/lib/errors/logger';

export interface ModelConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface ModelResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export abstract class BaseModel {
  protected config: ModelConfig;
  protected name: string;

  constructor(config: ModelConfig) {
    this.config = config;
    this.name = config.model;
  }

  abstract process(prompt: string, options?: Partial<ModelConfig>): Promise<ModelResponse>;
  
  protected async handleError(error: any): Promise<never> {
    ErrorLogger.error(`${this.name} processing error:`, error);
    throw new Error(`${this.name} processing failed: ${error.message}`);
  }

  protected mergeConfig(options?: Partial<ModelConfig>): ModelConfig {
    return {
      ...this.config,
      ...options
    };
  }
} 