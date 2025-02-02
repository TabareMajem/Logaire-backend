export interface CarrierRequest {
  route: {
    origin: string;
    destination: string;
  };
  requirements: {
    capacity: number;
    serviceLevel: string;
    transitTime?: {
      max: number;
      unit: 'hours' | 'days';
    };
  };
  preferences?: {
    cost?: 'low' | 'medium' | 'high';
    reliability?: number;
    sustainability?: boolean;
  };
}

export interface CarrierRecommendation {
  carrier: string;
  service: string;
  performance: {
    reliability: number;
    onTimeDelivery: number;
    claims: number;
  };
  alternatives: Array<{
    carrier: string;
    service: string;
    tradeoffs: {
      advantages: string[];
      disadvantages: string[];
    };
  }>;
  constraints: string[];
}