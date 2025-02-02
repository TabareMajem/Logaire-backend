import { z } from 'zod';
import { anthropic } from '@/lib/clients/anthropic';
import { AI_CONFIG, CONFIDENCE_THRESHOLDS } from './config';
import { AIAgentResponse, AIAgentContext } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export abstract class BaseAgent {
  protected context: AIAgentContext;

  constructor(context: AIAgentContext) {
    this.context = context;
  }

  protected async generatePrompt(
    template: string,
    variables: Record<string, any>
  ): Promise<string> {
    try {
      const prompt = await this.loadPromptTemplate(template);
      return this.interpolateVariables(prompt, variables);
    } catch (error) {
      ErrorLogger.error('Failed to generate prompt', error as Error);
      throw error;
    }
  }

  protected async callAI<T>(
    prompt: string,
    responseSchema: z.ZodType<T>
  ): Promise<AIAgentResponse<T>> {
    try {
      const response = await anthropic.messages.create({
        model: AI_CONFIG.model,
        max_tokens: AI_CONFIG.defaultMaxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: AI_CONFIG.systemPrompt
      });

      const parsedResponse = this.parseAIResponse(response, responseSchema);
      return this.validateAndEnrichResponse(parsedResponse);
    } catch (error) {
      ErrorLogger.error('AI call failed', error as Error);
      throw error;
    }
  }

  private async loadPromptTemplate(templateName: string): Promise<string> {
    const template = await import(`@/lib/ai/prompts/${templateName}.txt`);
    return template.default;
  }

  private interpolateVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    return template.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => variables[key]?.toString() ?? ''
    );
  }

  private parseAIResponse<T>(
    response: any,
    schema: z.ZodType<T>
  ): AIAgentResponse<T> {
    try {
      const parsed = schema.parse(JSON.parse(response.content));
      return {
        data: parsed,
        confidence: this.calculateConfidence(response),
        reasoning: this.extractReasoning(response),
      };
    } catch (error) {
      ErrorLogger.error('Failed to parse AI response', error as Error);
      throw error;
    }
  }

  private calculateConfidence(response: any): number {
    // Implement confidence calculation based on response metadata
    return 0.8; // Placeholder
  }

  private extractReasoning(response: any): string[] {
    // Extract reasoning from response
    return []; // Placeholder
  }

  protected validateAndEnrichResponse<T>(
    response: AIAgentResponse<T>
  ): AIAgentResponse<T> {
    if (response.confidence < CONFIDENCE_THRESHOLDS.LOW) {
      throw new Error('AI response confidence too low');
    }
    return response;
  }
}