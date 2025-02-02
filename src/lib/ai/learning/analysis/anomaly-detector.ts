import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface Anomaly {
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export class AnomalyDetector {
  async detectAnomalies(
    experiences: AgentExperience[],
    sensitivityThreshold: number = 2
  ): Promise<Anomaly[]> {
    try {
      const anomalies: Anomaly[] = [];
      const metrics = ['accuracy', 'duration', 'resourceUsage', 'quality'];

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
            deviation,
            severity: this.calculateSeverity(deviation),
            timestamp: experiences[experiences.length - 1].timestamp
          });
        }
      }

      return this.prioritizeAnomalies(anomalies);
    } catch (error) {
      ErrorLogger.error('Anomaly detection failed', error as Error);
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

  private calculateSeverity(deviation: number): 'low' | 'medium' | 'high' {
    if (deviation > 4) return 'high';
    if (deviation > 3) return 'medium';
    return 'low';
  }

  private prioritizeAnomalies(anomalies: Anomaly[]): Anomaly[] {
    return anomalies.sort((a, b) => {
      // First sort by severity
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;

      // Then by deviation
      return b.deviation - a.deviation;
    });
  }
}