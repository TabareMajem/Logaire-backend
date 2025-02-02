import { AgentMetrics, PerformanceThresholds } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export class PerformanceAnalyzer {
  private readonly defaultThresholds: PerformanceThresholds = {
    maxLatency: 5000, // 5 seconds
    minSuccessRate: 0.95, // 95%
    maxErrorRate: 0.05, // 5%
    maxMemoryUsage: 512, // 512 MB
    maxCpuUsage: 80 // 80%
  };

  analyzePerformance(
    metrics: AgentMetrics,
    thresholds: Partial<PerformanceThresholds> = {}
  ): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    try {
      const finalThresholds = { ...this.defaultThresholds, ...thresholds };
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check latency
      if (metrics.averageLatency > finalThresholds.maxLatency) {
        issues.push(`High latency: ${metrics.averageLatency}ms`);
        recommendations.push('Consider optimizing task execution or increasing resources');
      }

      // Check success rate
      if (metrics.successRate < finalThresholds.minSuccessRate) {
        issues.push(`Low success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
        recommendations.push('Review error patterns and implement additional error handling');
      }

      // Check error rate
      if (metrics.errorRate > finalThresholds.maxErrorRate) {
        issues.push(`High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
        recommendations.push('Investigate common failure patterns and add validation');
      }

      // Check resource usage
      if (metrics.resourceUsage.memory > finalThresholds.maxMemoryUsage) {
        issues.push(`High memory usage: ${metrics.resourceUsage.memory}MB`);
        recommendations.push('Optimize memory usage or increase memory limit');
      }

      if (metrics.resourceUsage.cpu > finalThresholds.maxCpuUsage) {
        issues.push(`High CPU usage: ${metrics.resourceUsage.cpu}%`);
        recommendations.push('Review CPU-intensive operations or scale resources');
      }

      return {
        healthy: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      ErrorLogger.error('Performance analysis failed', error as Error);
      throw error;
    }
  }

  detectAnomalies(
    history: AgentMetrics[],
    sensitivityThreshold: number = 2
  ): Array<{
    metric: string;
    value: number;
    expected: number;
    deviation: number;
  }> {
    try {
      const anomalies = [];

      // Calculate mean and standard deviation for each metric
      const metrics = ['successRate', 'averageLatency', 'errorRate', 'throughput'];
      
      for (const metric of metrics) {
        const values = history.map(h => h[metric as keyof AgentMetrics] as number);
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
}