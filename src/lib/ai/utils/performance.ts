export interface PerformanceMetrics {
  latency: number;
  memoryUsage: number;
  successRate: number;
  errorRate: number;
  throughput: number;
}

export function calculatePerformanceMetrics(
  startTime: number,
  executions: Array<{ success: boolean; duration: number }>
): PerformanceMetrics {
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.success).length;
  const totalDuration = executions.reduce((sum, e) => sum + e.duration, 0);

  return {
    latency: totalExecutions > 0 ? totalDuration / totalExecutions : 0,
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
    successRate: totalExecutions > 0 ? successfulExecutions / totalExecutions : 1,
    errorRate: totalExecutions > 0 ? (totalExecutions - successfulExecutions) / totalExecutions : 0,
    throughput: totalDuration > 0 ? (totalExecutions * 1000) / totalDuration : 0
  };
}

export function checkPerformanceThresholds(
  metrics: PerformanceMetrics,
  thresholds: Partial<Record<keyof PerformanceMetrics, number>>
): string[] {
  const violations: string[] = [];

  for (const [metric, value] of Object.entries(metrics)) {
    const threshold = thresholds[metric as keyof PerformanceMetrics];
    if (threshold !== undefined && value > threshold) {
      violations.push(`${metric} exceeds threshold: ${value} > ${threshold}`);
    }
  }

  return violations;
}