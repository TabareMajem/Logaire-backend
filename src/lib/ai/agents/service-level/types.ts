export interface ServiceMetrics {
  transitTime: number;
  reliability: number;
  cost: number;
  flexibility?: number;
}

export interface ServiceRequirements {
  maxTransitTime?: number;
  minReliability?: number;
  maxCost?: number;
  priority: 'speed' | 'cost' | 'reliability';
  specialHandling?: string[];
}

export interface ServiceImprovement {
  metric: string;
  current: number;
  target: number;
  impact: 'high' | 'medium' | 'low';
  feasibility: 'easy' | 'moderate' | 'difficult';
}

export interface ServiceAlternative {
  service: string;
  metrics: ServiceMetrics;
  tradeoffs: {
    benefits: string[];
    drawbacks: string[];
  };
  additionalCost: number;
}