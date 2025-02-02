import { env } from '@/env.mjs';
import { Anthropic } from '@anthropic-ai/sdk';
import { BaseModel, ModelConfig, ModelResponse } from './base-model';

export class ClaudeModel extends BaseModel {
  private client: Anthropic;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY
    });
  }

  async process(prompt: string, options?: Partial<ModelConfig>): Promise<ModelResponse> {
    try {
      const config = this.mergeConfig(options);
      
      const response = await this.client.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature,
      });

      // Claude doesn't provide token usage directly, so we estimate
      const estimatedTokens = Math.ceil(prompt.length / 4) + 
                            Math.ceil((response.content[0].text || '').length / 4);

      return {
        text: response.content[0].text,
        usage: {
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: Math.ceil((response.content[0].text || '').length / 4),
          totalTokens: estimatedTokens
        },
        metadata: {
          model: response.model,
          stopReason: response.stop_reason
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
} 