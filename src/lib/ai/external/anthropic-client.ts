import { anthropic } from '@/lib/clients/anthropic';
import { ErrorLogger } from '@/lib/errors/logger';

interface AnthropicRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export class AnthropicClient {
  private static readonly DEFAULT_MODEL = 'claude-3-opus-20240229';
  private static readonly DEFAULT_MAX_TOKENS = 1024;

  async complete(request: AnthropicRequest): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: request.model || AnthropicClient.DEFAULT_MODEL,
        max_tokens: request.maxTokens || AnthropicClient.DEFAULT_MAX_TOKENS,
        messages: [{
          role: 'user',
          content: request.prompt
        }],
        temperature: request.temperature || 0.7
      });

      return response.content[0].text;
    } catch (error) {
      ErrorLogger.error('Anthropic API call failed', error as Error);
      throw error;
    }
  }

  async analyze(text: string, task: string): Promise<any> {
    const prompt = `
      Analyze the following text for ${task}:
      
      ${text}
      
      Provide a structured analysis in JSON format.
    `;

    try {
      const response = await this.complete({ prompt });
      return JSON.parse(response);
    } catch (error) {
      ErrorLogger.error('Text analysis failed', error as Error);
      throw error;
    }
  }
}