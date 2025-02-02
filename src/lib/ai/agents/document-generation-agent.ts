import { z } from 'zod';
import { openAIEmbeddings } from '../embeddings/openai';
import { EnhancedAgentOptions, EnhancedBaseAgent } from './base/enhanced-base-agent';

const DocumentGenerationInput = z.object({
  template: z.string(),
  variables: z.record(z.any()),
  format: z.enum(['pdf', 'docx', 'txt']),
  metadata: z.record(z.any()).optional()
});

const DocumentGenerationOutput = z.object({
  content: z.string(),
  format: z.string(),
  metadata: z.record(z.any()),
  generationTime: z.number()
});

type DocumentGenerationInput = z.infer<typeof DocumentGenerationInput>;
type DocumentGenerationOutput = z.infer<typeof DocumentGenerationOutput>;

export class DocumentGenerationAgent extends EnhancedBaseAgent {
  constructor(id: string, options?: EnhancedAgentOptions) {
    super(id, {
      ...options,
      validateOutput: true,
      recoveryEnabled: true
    });
  }

  protected async processInternal(
    input: DocumentGenerationInput
  ): Promise<DocumentGenerationOutput> {
    const startTime = Date.now();

    try {
      // Validate input
      DocumentGenerationInput.parse(input);

      // Generate embeddings for template context
      const templateEmbeddings = await openAIEmbeddings.generateEmbeddings(
        input.template
      );

      // Process template with variables
      const content = await this.processTemplate(input.template, input.variables);

      // Generate output document
      const result: DocumentGenerationOutput = {
        content,
        format: input.format,
        metadata: {
          ...input.metadata,
          templateEmbeddings,
          generatedAt: new Date().toISOString()
        },
        generationTime: Date.now() - startTime
      };

      await this.recordMetric('document_generation_time', result.generationTime, {
        format: input.format
      });

      return result;
    } catch (error) {
      this.logError(error as Error, 'document generation');
      throw error;
    }
  }

  protected async validateResult(result: any): Promise<void> {
    try {
      DocumentGenerationOutput.parse(result);
    } catch (error) {
      throw new Error(`Invalid document generation output: ${error.message}`);
    }
  }

  private async processTemplate(
    template: string,
    variables: Record<string, any>
  ): Promise<string> {
    // Simple template processing - replace variables
    let processed = template;
    for (const [key, value] of Object.entries(variables)) {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return processed;
  }
} 