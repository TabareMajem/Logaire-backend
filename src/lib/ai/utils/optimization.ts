export interface OptimizationResult {
  score: number;
  improvements: string[];
  constraints: string[];
}

export function calculateOptimizationScore(
  metrics: Record<string, number>,
  weights: Record<string, number>
): number {
  return Object.entries(metrics).reduce(
    (score, [metric, value]) => score + (value * (weights[metric] || 0)),
    0
  );
}

export function identifyImprovements(
  current: Record<string, number>,
  optimized: Record<string, number>,
  thresholds: Record<string, number>
): string[] {
  const improvements: string[] = [];

  for (const [metric, value] of Object.entries(optimized)) {
    const currentValue = current[metric] || 0;
    const threshold = thresholds[metric] || 0;
    const improvement = ((value - currentValue) / currentValue) * 100;

    if (improvement > threshold) {
      improvements.push(
        `${metric}: ${improvement.toFixed(1)}% improvement`
      );
    }
  }

  return improvements;
}

export function validateConstraints(
  solution: Record<string, number>,
  constraints: Record<string, number>
): string[] {
  const violations: string[] = [];

  for (const [constraint, limit] of Object.entries(constraints)) {
    const value = solution[constraint];
    if (value > limit) {
      violations.push(
        `${constraint} exceeds limit: ${value} > ${limit}`
      );
    }
  }

  return violations;
}