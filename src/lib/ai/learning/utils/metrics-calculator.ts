import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class MetricsCalculator {
  calculateMovingAverage(
    values: number[],
    windowSize: number = 10
  ): number[] {
    try {
      const result: number[] = [];
      for (let i = 0; i < values.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = values.slice(start, i + 1);
        const average = window.reduce((sum, val) => sum + val, 0) / window.length;
        result.push(average);
      }
      return result;
    } catch (error) {
      ErrorLogger.error('Failed to calculate moving average', error as Error);
      throw error;
    }
  }

  calculateExponentialMovingAverage(
    values: number[],
    alpha: number = 0.2
  ): number[] {
    try {
      const result: number[] = [values[0]];
      for (let i = 1; i < values.length; i++) {
        const ema = alpha * values[i] + (1 - alpha) * result[i - 1];
        result.push(ema);
      }
      return result;
    } catch (error) {
      ErrorLogger.error('Failed to calculate EMA', error as Error);
      throw error;
    }
  }

  calculatePerformanceScore(experience: AgentExperience): number {
    try {
      const weights = {
        accuracy: 0.4,
        quality: 0.3,
        efficiency: 0.3
      };

      const efficiencyScore = 1 - Math.min(experience.resourceUsage / 1000, 1);

      return (
        experience.accuracy * weights.accuracy +
        experience.quality * weights.quality +
        efficiencyScore * weights.efficiency
      );
    } catch (error) {
      ErrorLogger.error('Failed to calculate performance score', error as Error);
      throw error;
    }
  }
}