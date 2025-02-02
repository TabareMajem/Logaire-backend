//src/lib/ai/context/types.ts -->

export interface MarketConditions {
  fuelPrices: number;
  portCongestion: Record<string, number>;
  weatherConditions: Record<string, string>;
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  successRate: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
  lastUpdated: Date;
  accuracy: number;
  latency: number;
  resourceEfficiency: number;
  qualityScore: number;
  overallScore: number;
}

export interface UserPreferences {
  preferredCarriers?: string[];
  costSensitivity?: 'low' | 'medium' | 'high';
  sustainabilityFocus?: boolean;
  transitTimePreference?: 'fastest' | 'balanced' | 'economical';
}

export interface EnvironmentalData {
  carbonEmissions: {
    current: number;
    target: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  sustainabilityScore: number;
  environmentalRisks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    probability: number;
    impact: number;
  }>;
  lastUpdated: Date;
}