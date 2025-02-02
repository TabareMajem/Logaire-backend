import { OpenAI } from '@/lib/ai/providers/openai';
import { cacheManager } from '@/lib/cache/cache-manager';
import { ErrorLogger } from '@/lib/errors/logger';
import { metricsCollector } from '@/lib/monitoring/metrics/metrics-collector';

export interface Entity {
  type: string;
  value: string;
  confidence: number;
  position?: {
    start: number;
    end: number;
  };
  metadata?: Record<string, any>;
}

interface ExtractionResult {
  entities: Entity[];
  metadata: {
    processingTime: number;
    modelUsed: string;
    confidence: number;
  };
}

export class EntityExtractor {
  private openai: OpenAI;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  constructor() {
    this.openai = new OpenAI();
  }

  async extractEntities(text: string, documentType: string): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `entity-extraction:${Buffer.from(text).toString('base64')}`;
      const cached = await cacheManager.get<ExtractionResult>(cacheKey);
      if (cached) return cached;

      // Prepare the extraction prompt
      const prompt = this.buildExtractionPrompt(text, documentType);
      
      // Extract entities using AI
      const completion = await this.openai.createCompletion({
        model: 'gpt-4',
        prompt,
        temperature: 0.3,
        max_tokens: 500
      });

      // Parse and validate the extracted entities
      const entities = await this.parseAndValidateEntities(
        completion.choices[0].text,
        documentType
      );

      const result: ExtractionResult = {
        entities,
        metadata: {
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4',
          confidence: this.calculateOverallConfidence(entities)
        }
      };

      // Cache the results
      await cacheManager.set(cacheKey, result, this.CACHE_TTL);

      // Record metrics
      await this.recordExtractionMetrics(documentType, result);

      return result;
    } catch (error) {
      ErrorLogger.error('Entity extraction error:', error as Error);
      throw error;
    }
  }

  private buildExtractionPrompt(text: string, documentType: string): string {
    // Customize prompt based on document type
    const prompts = {
      invoice: `Extract the following entities from this invoice:
        - Invoice number
        - Date
        - Total amount
        - Vendor details
        - Line items
        Format: JSON`,
      bill_of_lading: `Extract the following entities from this Bill of Lading:
        - B/L number
        - Vessel
        - Port of loading
        - Port of discharge
        - Container numbers
        Format: JSON`
    };

    return `${prompts[documentType] || 'Extract key entities from this document:'}\n\n${text}`;
  }

  private async parseAndValidateEntities(
    rawExtraction: string,
    documentType: string
  ): Promise<Entity[]> {
    try {
      const parsed = JSON.parse(rawExtraction);
      const entities: Entity[] = [];

      for (const [key, value] of Object.entries(parsed)) {
        if (this.isValidEntity(value)) {
          entities.push({
            type: key,
            value: value as string,
            confidence: await this.calculateEntityConfidence(key, value as string, documentType)
          });
        }
      }

      return entities.filter(e => e.confidence >= this.CONFIDENCE_THRESHOLD);
    } catch (error) {
      ErrorLogger.error('Entity parsing error:', error as Error);
      return [];
    }
  }

  private isValidEntity(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private async calculateEntityConfidence(
    type: string,
    value: string,
    documentType: string
  ): Promise<number> {
    // Implement confidence calculation logic based on entity type and value
    // This could involve regex patterns, validation rules, or ML models
    return 0.9; // Placeholder
  }

  private calculateOverallConfidence(entities: Entity[]): number {
    if (entities.length === 0) return 0;
    return entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
  }

  private async recordExtractionMetrics(
    documentType: string,
    result: ExtractionResult
  ): Promise<void> {
    await metricsCollector.recordMetric(
      'document_processing',
      result.entities.length,
      {
        type: documentType,
        operation: 'entity_extraction'
      },
      {
        processingTime: result.metadata.processingTime,
        confidence: result.metadata.confidence,
        modelUsed: result.metadata.modelUsed
      }
    );
  }
}

export const entityExtractor = new EntityExtractor(); 