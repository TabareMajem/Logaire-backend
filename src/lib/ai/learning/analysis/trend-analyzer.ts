import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class TrendAnalyzer {
  async analyzeTrends(experiences: AgentExperience[]): Promise<Record<string, number>> {
    try {
      const sortedExperiences = [...experiences].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      return {
        successRate: this.calculateTrend(
          sortedExperiences.map(e => e.success ? 1 : 0)
        ),
        accuracy: this.calculateTrend(
          sortedExperiences.map(e => e.accuracy)
        ),
        quality: this.calculateTrend(
          sortedExperiences.map(e => e.quality)
        ),
        resourceEfficiency: this.calculateTrend(
          sortedExperiences.map(e => 1 - (e.resourceUsage / 1000))
        )
      };
    } catch (error) {
      ErrorLogger.error('Failed to analyze trends', error as Error);
      throw error;
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const xMean = (values.length - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / values.length;

    const numerator = values.reduce((sum, y, x) => 
      sum + ((x - xMean) * (y - yMean)), 
      0
    );
    
    const denominator = values.reduce((sum, _, x) => 
      sum + Math.pow(x - xMean, 2), 
      0
    );

    return numerator / denominator;
  }

  async detectAnomalies(
    experiences: AgentExperience[],
    sensitivityThreshold: number = 2
  ): Promise<Array<{
    metric: string;
    value: number;
    expected: number;
    deviation: number;
  }>> {
    try {
      const metrics = ['accuracy', 'quality', 'resourceUsage'];
      const anomalies = [];

      for (const metric of metrics) {
        const values = experiences.map(e => e[metric as keyof AgentExperience] as number);
        const { mean, stdDev } = this.calculateStats(values);

        const latest = values[values.length - 1];
        const deviation = Math.abs(latest - mean) / stdDev;

        if (deviation > sensitivityThreshold) {
          anomalies.push({
            metric,
            value: latest,
            expected: mean,
            deviation
          });
        }
      }

      return anomalies;
    } catch (error) {
      ErrorLogger.error('Failed to detect anomalies', error as Error);
      throw error;
    }
  }

  private calculateStats(values: number[]): { mean: number; stdDev: number } {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }
}