import { env } from '@/env.mjs';
import { Configuration, OpenAIApi } from 'openai';
import { BaseModel, ModelConfig, ModelResponse } from './base-model';

export class OpenAIModel extends BaseModel {
  private api: OpenAIApi;

  constructor(config: ModelConfig) {
    super(config);
    this.api = new OpenAIApi(
      new Configuration({
        apiKey: env.OPENAI_API_KEY
      })
    );
  }

  async process(prompt: string, options?: Partial<ModelConfig>): Promise<ModelResponse> {
    try {
      const config = this.mergeConfig(options);
      
      const response = await this.api.createChatCompletion({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        stop: config.stop
      });

      return {
        text: response.data.choices[0].message?.content || '',
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        },
        metadata: {
          model: response.data.model,
          finishReason: response.data.choices[0].finish_reason
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
} 