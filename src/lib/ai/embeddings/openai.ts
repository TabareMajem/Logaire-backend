import { ErrorLogger } from '@/lib/errors/logger';
import { Configuration, OpenAIApi } from 'openai';

export class OpenAIEmbeddings {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await this.openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: text,
      });
      return response.data.data[0].embedding;
    } catch (error) {
      ErrorLogger.error('OpenAI embeddings generation error:', error as Error);
      throw error;
    }
  }
}

export const openAIEmbeddings = new OpenAIEmbeddings(); 