import { ErrorLogger } from '@/lib/errors/logger';

export class TextNormalizer {
  normalize(text: string): string {
    try {
      return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
    } catch (error) {
      ErrorLogger.error('Text normalization failed', error as Error);
      return text;
    }
  }

  extractNumbers(text: string): number[] {
    try {
      return text.match(/\d+/g)?.map(Number) || [];
    } catch (error) {
      ErrorLogger.error('Number extraction failed', error as Error);
      return [];
    }
  }

  extractDates(text: string): Date[] {
    try {
      const dateMatches = text.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g) || [];
      return dateMatches.map(match => new Date(match));
    } catch (error) {
      ErrorLogger.error('Date extraction failed', error as Error);
      return [];
    }
  }
}