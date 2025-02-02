import { StrategyUpdate } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class StrategyValidator {
  validate(update: StrategyUpdate): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate changes
      this.validateChanges(update.changes, errors, warnings);

      // Validate confidence
      this.validateConfidence(update.confidence, errors);

      // Validate timestamp
      this.validateTimestamp(update.timestamp, errors);

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      ErrorLogger.error('Strategy validation failed', error as Error);
      throw error;
    }
  }

  private validateChanges(
    changes: StrategyUpdate['changes'],
    errors: string[],
    warnings: string[]
  ): void {
    if (!changes.length) {
      errors.push('Strategy must include at least one change');
      return;
    }

    for (const change of changes) {
      // Validate parameter
      if (!change.parameter) {
        errors.push('Change must specify a parameter');
        continue;
      }

      // Validate values
      if (change.newValue === undefined) {
        errors.push(`New value required for parameter: ${change.parameter}`);
      }
      if (change.oldValue === undefined) {
        warnings.push(`Old value missing for parameter: ${change.parameter}`);
      }

      // Validate reason
      if (!change.reason) {
        warnings.push(`Change reason missing for parameter: ${change.parameter}`);
      }

      // Check for significant changes
      const changePercent = this.calculateChangePercent(change.oldValue, change.newValue);
      if (changePercent > 50) {
        warnings.push(`Large change (${changePercent.toFixed(1)}%) detected for ${change.parameter}`);
      }
    }
  }

  private validateConfidence(confidence: number, errors: string[]): void {
    if (confidence < 0 || confidence > 1) {
      errors.push('Confidence must be between 0 and 1');
    }
    if (confidence < 0.5) {
      errors.push('Strategy confidence too low');
    }
  }

  private validateTimestamp(timestamp: Date, errors: string[]): void {
    const now = new Date();
    if (timestamp > now) {
      errors.push('Strategy timestamp cannot be in the future');
    }
    if (now.getTime() - timestamp.getTime() > 60 * 1000) {
      errors.push('Strategy is too old (>1 minute)');
    }
  }

  private calculateChangePercent(oldValue: any, newValue: any): number {
    if (typeof oldValue !== 'number' || typeof newValue !== 'number') {
      return 0;
    }
    return Math.abs((newValue - oldValue) / oldValue * 100);
  }
}