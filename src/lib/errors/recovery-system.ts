import { alertSystem } from '../monitoring/alerts/alert-system';
import { ErrorLogger } from './logger';

export class ErrorRecoverySystem {
  private static readonly MAX_RETRIES = 3;
  private static readonly BACKOFF_MULTIPLIER = 1.5;

  static async attemptRecovery(
    operation: () => Promise<any>,
    context: string,
    initialDelay = 1000
  ): Promise<any> {
    let attempts = 0;
    let delay = initialDelay;

    while (attempts < this.MAX_RETRIES) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        ErrorLogger.error(
          `Recovery attempt ${attempts} failed for ${context}:`,
          error as Error
        );

        if (attempts === this.MAX_RETRIES) {
          await alertSystem.createAlert({
            type: 'recovery_failed',
            severity: 'error',
            message: `Recovery failed after ${attempts} attempts for ${context}`
          });
          throw error;
        }

        await this.wait(delay);
        delay *= this.BACKOFF_MULTIPLIER;
      }
    }
  }

  private static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 