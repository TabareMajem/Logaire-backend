export interface RiskAssessmentRequest {
  shipmentId: string;
  route: {
    origin: string;
    destination: string;
    transitPoints?: string[];
  };
  cargo: {
    type: string;
    value: number;
    hazardous: boolean;
  };
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  factors: Array<{
    type: 'weather' | 'political' | 'operational' | 'security';
    severity: 'low' | 'medium' | 'high';
    likelihood: number;
    impact: string;
    mitigation?: string[];
  }>;
  recommendations: string[];
  contingencyPlans: Array<{
    trigger: string;
    actions: string[];
  }>;
}