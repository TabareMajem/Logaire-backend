export interface OptimizationMetrics {
  cost: number;
  time: number;
  reliability: number;
  sustainability?: number;
}

export interface OptimizationConstraints {
  maxCost?: number;
  maxTime?: number;
  minReliability?: number;
  preferences?: string[];
}

export interface OptimizationImpact {
  metrics: OptimizationMetrics;
  changes: Array<{
    factor: string;
    before: number;
    after: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}

export interface OptimizationConflict {
  factors: string[];
  severity: 'low' | 'medium' | 'high';
  resolution?: {
    action: string;
    impact: OptimizationImpact;
  };
}

export interface OptimizationScore {
  value: number;
  breakdown: Record<string, number>;
  confidence: number;
}