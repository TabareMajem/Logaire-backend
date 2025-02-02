import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class ExperienceValidator {
  validate(experience: AgentExperience): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate required fields
      this.validateRequiredFields(experience, errors);

      // Validate numeric ranges
      this.validateNumericRanges(experience, errors, warnings);

      // Validate timestamps
      this.validateTimestamps(experience, errors);

      // Validate data consistency
      this.validateConsistency(experience, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      ErrorLogger.error('Experience validation failed', error as Error);
      throw error;
    }
  }

  private validateRequiredFields(experience: AgentExperience, errors: string[]): void {
    if (!experience.agentType) {
      errors.push('Agent type is required');
    }
    if (!experience.taskType) {
      errors.push('Task type is required');
    }
    if (!experience.input) {
      errors.push('Input data is required');
    }
    if (!experience.output) {
      errors.push('Output data is required');
    }
  }

  private validateNumericRanges(
    experience: AgentExperience,
    errors: string[],
    warnings: string[]
  ): void {
    if (experience.accuracy < 0 || experience.accuracy > 1) {
      errors.push('Accuracy must be between 0 and 1');
    }
    if (experience.quality < 0 || experience.quality > 1) {
      errors.push('Quality must be between 0 and 1');
    }
    if (experience.resourceUsage < 0) {
      errors.push('Resource usage cannot be negative');
    }
    if (experience.duration < 0) {
      errors.push('Duration cannot be negative');
    }

    // Add warnings for suspicious values
    if (experience.accuracy === 1) {
      warnings.push('Perfect accuracy detected - verify if this is correct');
    }
    if (experience.duration < 10) {
      warnings.push('Unusually fast execution detected');
    }
  }

  private validateTimestamps(experience: AgentExperience, errors: string[]): void {
    const now = new Date();
    if (experience.timestamp > now) {
      errors.push('Timestamp cannot be in the future');
    }
    if (now.getTime() - experience.timestamp.getTime() > 24 * 60 * 60 * 1000) {
      errors.push('Experience is more than 24 hours old');
    }
  }

  private validateConsistency(experience: AgentExperience, warnings: string[]): void {
    if (experience.success && experience.accuracy < 0.5) {
      warnings.push('Successful execution with low accuracy detected');
    }
    if (!experience.success && experience.accuracy > 0.8) {
      warnings.push('Failed execution with high accuracy detected');
    }
    if (experience.quality > experience.accuracy) {
      warnings.push('Quality score exceeds accuracy - verify metrics');
    }
  }
}