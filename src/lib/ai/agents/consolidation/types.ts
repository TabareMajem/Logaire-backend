export interface ConsolidationRequest {
  shipments: Array<{
    id: string;
    origin: string;
    destination: string;
    volume: number;
    weight: number;
    readyDate: Date;
    deadline: Date;
    type: string;
  }>;
  constraints: {
    maxDelay?: number;
    maxDistance?: number;
    minSavings?: number;
  };
}

export interface ConsolidationPlan {
  groups: Array<{
    shipments: string[];
    consolidationPoint: string;
    schedule: {
      consolidation: Date;
      departure: Date;
      arrival: Date;
    };
    metrics: {
      volumeUtilization: number;
      weightUtilization: number;
    };
  }>;
  savings: {
    total: number;
    breakdown: {
      transportation: number;
      handling: number;
      time: number;
    };
  };
  schedule: {
    feasibility: 'high' | 'medium' | 'low';
    risks: string[];
    buffers: Record<string, number>;
  };
  constraints: string[];
}