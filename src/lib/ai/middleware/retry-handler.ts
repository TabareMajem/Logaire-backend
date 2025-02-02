import { AI_RATE_LIMITS } from '../config/constants';
import { ErrorLogger } from '@/lib/errors/logger';
import { AIError } from '../utils/error-handler';

type RetryableFunction<T> = () => Promise<T>;

export class RetryHandler {
  static async withRetry<T>(
    fn: RetryableFunction<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= AI_RATE_LIMITS.MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (!this.isRetryableError(error)) {
          throw error;
        }

        ErrorLogger.warn(`Retry attempt ${attempt} for ${context}`, error as Error);
        
        if (attempt < AI_RATE_LIMITS.MAX_RETRIES) {
          await this.delay(attempt);
        }
      }
    }

    throw new AIError(
      `Failed after ${AI_RATE_LIMITS.MAX_RETRIES} retries`,
      'MAX_RETRIES_EXCEEDED',
      { context, originalError: lastError }
    );
  }

  private static isRetryableError(error: unknown): boolean {
    if (error instanceof AIError) {
      return error.code === 'RATE_LIMIT' || error.code === 'MODEL_ERROR';
    }
    return false;
  }

  private static delay(attempt: number): Promise<void> {
    const backoff = Math.min(
      AI_RATE_LIMITS.RETRY_DELAY_MS * Math.pow(2, attempt - 1),
      5000
    );
    return new Promise(resolve => setTimeout(resolve, backoff));
  }
}