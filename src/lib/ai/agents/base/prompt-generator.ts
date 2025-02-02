import { ErrorLogger } from '@/lib/errors/logger';

export interface PromptTemplate {
  template: string;
  variables: Record<string, any>;
  examples?: string[];
  contextEmbeddings?: number[];
}

export class PromptGenerator {
  private cache: Map<string, string> = new Map();

  async generatePrompt(template: PromptTemplate): Promise<string> {
    try {
      const cacheKey = this.getCacheKey(template);
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      let prompt = template.template;

      // Replace variables
      for (const [key, value] of Object.entries(template.variables)) {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }

      // Add examples if provided
      if (template.examples?.length) {
        prompt += '\n\nExamples:\n' + template.examples.join('\n');
      }

      // Generate and add embeddings context if needed
      if (template.contextEmbeddings) {
        const contextPrompt = await this.generateContextPrompt(template.contextEmbeddings);
        prompt = contextPrompt + '\n\n' + prompt;
      }

      this.cache.set(cacheKey, prompt);
      return prompt;
    } catch (error) {
      ErrorLogger.error('Prompt generation error:', error as Error);
      throw error;
    }
  }

  private async generateContextPrompt(embeddings: number[]): Promise<string> {
    try {
      // Use embeddings to find relevant context
      const relevantContext = await this.findRelevantContext(embeddings);
      return `Context:\n${relevantContext}`;
    } catch (error) {
      ErrorLogger.error('Context generation error:', error as Error);
      return '';
    }
  }

  private async findRelevantContext(embeddings: number[]): Promise<string> {
    // This would typically involve a vector similarity search
    // For now, return empty string as placeholder
    return '';
  }

  private getCacheKey(template: PromptTemplate): string {
    return JSON.stringify({
      template: template.template,
      variables: template.variables,
      examples: template.examples
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const promptGenerator = new PromptGenerator();