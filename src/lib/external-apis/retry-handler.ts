import { ErrorLogger } from '@/lib/errors/logger';

interface RetryConfig {
  attempts: number;
  backoff: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  attempts: 3,
  backoff: 1000,
};

export class RetryHandler {
  static async withRetry<T>(
    fn: () => Promise<T>,
    context: string,
    config: RetryConfig = DEFAULT_CONFIG
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryable(error)) {
          throw error;
        }

        if (attempt < config.attempts) {
          const delay = this.calculateDelay(attempt, config.backoff);
          ErrorLogger.warn(`Retry attempt ${attempt} for ${context}`, error as Error);
          await this.delay(delay);
        }
      }
    }

    throw lastError;
  }

  private static isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      // Add specific error types that should be retried
      return true;
    }
    return false;
  }

  private static calculateDelay(attempt: number, baseDelay: number): number {
    return Math.min(
      baseDelay * Math.pow(2, attempt - 1),
      30000 // Max 30 seconds
    );
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}