import { env } from '@/env.mjs';
import { TextServiceClient } from '@google-ai/generativelanguage';
import { GoogleAuth } from 'google-auth-library';
import { BaseModel, ModelConfig, ModelResponse } from './base-model';

export class PaLMModel extends BaseModel {
  private client: TextServiceClient;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new TextServiceClient({
      authClient: new GoogleAuth().fromAPIKey(env.PALM_API_KEY)
    });
  }

  async process(prompt: string, options?: Partial<ModelConfig>): Promise<ModelResponse> {
    try {
      const config = this.mergeConfig(options);

      const response = await this.client.generateText({
        model: `models/${config.model}`,
        prompt: {
          text: prompt
        },
        temperature: config.temperature,
        candidateCount: 1,
        maxOutputTokens: config.maxTokens,
        topP: config.topP,
      });

      const result = response[0].candidates?.[0];

      if (!result) {
        throw new Error('No response generated');
      }

      // PaLM doesn't provide token usage, so we estimate
      const estimatedTokens = Math.ceil(prompt.length / 4) + 
                            Math.ceil((result.output || '').length / 4);

      return {
        text: result.output,
        usage: {
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: Math.ceil((result.output || '').length / 4),
          totalTokens: estimatedTokens
        },
        metadata: {
          model: config.model,
          safetyRatings: result.safetyRatings
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
} 