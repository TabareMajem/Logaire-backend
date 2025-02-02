// src/lib/ai/core/base-agent.ts -->

import { AIContext, AIResponse, ProcessingPipeline } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export abstract class BaseAgent {
  protected context: AIContext;
  protected pipeline: ProcessingPipeline;

  constructor(context: AIContext, pipeline: ProcessingPipeline) {
    this.context = context;
    this.pipeline = pipeline;
  }

  public async process<T>(input: any): Promise<AIResponse<T>> {
    try {
      let processedData = input;

      for (const rule of this.pipeline.rules) {
        if (rule.condition(processedData)) {
          processedData = await rule.action(processedData);
        }
      }

      return {
        data: processedData,
        confidence: this.calculateConfidence(processedData),
        reasoning: this.generateReasoning(processedData)
      }; 
    } catch (error) {
      ErrorLogger.error('Processing failed', error as Error);
      if (this.pipeline.fallback) {
        return this.pipeline.fallback(error as Error);
      }
      throw error;
    }
  }

  protected abstract calculateConfidence(data: any): number;
  protected abstract generateReasoning(data: any): string[];
} 