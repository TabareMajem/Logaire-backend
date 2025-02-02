export function calculateBaseConfidence(factors: Record<string, number>): number {
  const weights = {
    dataCompleteness: 0.3,
    dataQuality: 0.3,
    modelReliability: 0.2,
    historicalAccuracy: 0.2
  };

  return Object.entries(factors).reduce(
    (total, [factor, value]) => total + (value * (weights[factor as keyof typeof weights] || 0)),
    0
  );
}

export function adjustConfidence(baseConfidence: number, adjustments: Array<{
  condition: boolean;
  adjustment: number;
}>): number {
  const finalConfidence = adjustments.reduce(
    (confidence, { condition, adjustment }) => 
      condition ? confidence + adjustment : confidence,
    baseConfidence
  );

  return Math.max(0, Math.min(1, finalConfidence));
}