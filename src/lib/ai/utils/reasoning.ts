export interface ReasoningFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  explanation: string;
}

export function generateReasoning(
  factors: ReasoningFactor[],
  context?: Record<string, any>
): string[] {
  const reasoning: string[] = [];

  // Sort factors by impact
  const sortedFactors = factors.sort((a, b) => {
    const impactWeight = { high: 3, medium: 2, low: 1 };
    return impactWeight[b.impact] - impactWeight[a.impact];
  });

  // Generate reasoning statements
  for (const factor of sortedFactors) {
    const statement = `${factor.factor}: ${factor.explanation} (${factor.impact} impact)`;
    reasoning.push(statement);
  }

  // Add context-specific reasoning if available
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      reasoning.push(`${key}: ${value}`);
    }
  }

  return reasoning;
}

export function summarizeReasoning(
  reasoning: string[],
  maxLength: number = 3
): string[] {
  if (reasoning.length <= maxLength) {
    return reasoning;
  }

  const summary = reasoning.slice(0, maxLength - 1);
  const remaining = reasoning.length - (maxLength - 1);
  summary.push(`And ${remaining} more factors...`);

  return summary;
}