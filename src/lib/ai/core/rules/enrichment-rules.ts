import { ProcessingRule } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export function createEnrichmentRule(
  id: string,
  enricher: (data: any) => Promise<any>,
  errorHandler?: (error: Error) => Promise<any>
): ProcessingRule {
  return {
    id,
    type: 'enrichment',
    condition: () => true,
    action: async (data) => {
      try {
        return await enricher(data);
      } catch (error) {
        ErrorLogger.error(`Enrichment rule ${id} failed`, error as Error);
        if (errorHandler) {
          return errorHandler(error as Error);
        }
        throw error;
      }
    }
  };
}

export const commonEnrichmentRules = {
  addTimestamps: (): ProcessingRule =>
    createEnrichmentRule(
      'add-timestamps',
      async (data) => ({
        ...data,
        processedAt: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      })
    ),

  addMetadata: (metadata: Record<string, any>): ProcessingRule =>
    createEnrichmentRule(
      'add-metadata',
      async (data) => ({
        ...data,
        metadata: {
          ...data.metadata,
          ...metadata
        }
      })
    )
};