// src/lib/ai/agents/rate/types.ts -->

export interface MarketRates {
  averageRate: number;
  rateRange: { min: number; max: number };
  trendAnalysis: TrendAnalysis;
  lastUpdated: Date;
}

export interface MarketFactors {
  [key: string]: any;  // Define more specific fields as needed
  fuelPrice: number;
  portCongestion: number;
  weatherConditions: string;
}

export interface TrendAnalysis {
  direction: 'rising' | 'falling' | 'stable';
  strength: 'strong' | 'medium' | 'weak';
  factors: string[];
}

export interface RateRequest {
  origin: string;
  destination: string;
  cargoDetails: {
    type: string;
    weight: number;
    volume?: number;
  };
  constraints?: {
    maxPrice?: number;
    preferredCarriers?: string[];
    serviceLevel?: string;
  };
}

export interface RateResponse {
  data: any;
  recommendations: RateRecommendation[];
  marketAnalysis: {
    trend: 'rising' | 'falling' | 'stable';
    confidence: number;
    factors: string[];
  };
  alternatives: RateAlternative[];
}

export interface RateRecommendation {
  carrier: string;
  service: string;
  price: {
    amount: number;
    currency: string;
  };
  transitTime: {
    min: number;
    max: number;
    unit: 'days' | 'hours';
  };
  confidence: number;
  reasoning: string[];
}

export interface RateAlternative {
  option: RateRecommendation;
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
}