import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { AIAgentResponse } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

const DocumentAnalysisSchema = z.object({
  documentType: z.string(),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
    confidence: z.number()
  })),
  summary: z.string(),
  warnings: z.array(z.string()).optional(),
  nextActions: z.array(z.string()).optional()
});

type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

export class DocumentAnalysisAgent extends BaseAgent {
  async analyzeDocument(
    documentContent: string,
    documentType?: string
  ): Promise<AIAgentResponse<DocumentAnalysis>> {
    try {
      const prompt = await this.generatePrompt('document-analysis', {
        content: documentContent,
        type: documentType,
        context: this.context
      });

      return await this.callAI(prompt, DocumentAnalysisSchema);
    } catch (error) {
      ErrorLogger.error('Document analysis failed', error as Error);
      throw error;
    }
  }
}