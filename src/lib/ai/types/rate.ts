import { z } from 'zod';

export interface Rate {
  price: {
    amount: number;
    currency: string;
  };
  carrier: string;
  serviceLevel: 'economy' | 'standard' | 'express';
  transitTime: {
    min: number;
    max: number;
    unit: 'days' | 'hours';
  };
}

export interface RateRequest {
  origin: {
    code: string;
  };
  destination: {
    code: string;
  };
  constraints?: RateConstraints;
}

export interface RateConstraints {
  maxRate?: number;
  preferredCarriers?: string[];
  serviceLevel?: 'economy' | 'standard' | 'express';
  specialRequirements?: {
    refrigerated?: boolean;
    hazardous?: boolean;
    oversized?: boolean;
  };
}

export interface CarrierPerformance {
  reliability: number;
  averageDelay: number;
  damageRate: number;
  customerRating: number;
}

export interface RateRecommendation {
  recommendedRate: {
    carrier: string;
    service: string;
    rate: number;
    currency: string;
    transitTime: {
      min: number;
      max: number;
      unit: 'days' | 'hours';
    };
  };
  reasoning: string[];
  marketAnalysis: {
    trend: 'rising' | 'falling' | 'stable';
    factors: string[];
  };
  alternatives: Array<{
    carrier: string;
    rate: number;
    tradeoffs: string[];
  }>;
}

export const rateRecommendationSchema = z.object({
  recommendedRate: z.object({
    carrier: z.string(),
    service: z.string(),
    rate: z.number(),
    currency: z.string(),
    transitTime: z.object({
      min: z.number(),
      max: z.number(),
      unit: z.enum(['days', 'hours'])
    })
  }),
  reasoning: z.array(z.string()),
  marketAnalysis: z.object({
    trend: z.enum(['rising', 'falling', 'stable']),
    factors: z.array(z.string())
  }),
  alternatives: z.array(z.object({
    carrier: z.string(),
    rate: z.number(),
    tradeoffs: z.array(z.string())
  }))
});