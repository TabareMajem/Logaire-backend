import { z } from 'zod';
import { Route } from './routing';
import { RateRecommendation } from './rate';
import { RiskAssessment } from './risk';
import { ScheduleOptimization } from './scheduling';
import { RiskResponse } from '../agents/risk/types';

export interface ShipmentOptimization {
  route: Route;
  rates: RateRecommendation;
  risks: RiskResponse;
  schedule: ScheduleOptimization;
  summary: {
    confidence: number;
    recommendations: string[];
    warnings: string[];
  };
}

export interface DisruptionResponse {
  impact: {
    severity: 'low' | 'medium' | 'high';
    affectedAreas: string[];
    estimatedDelay?: number;
  };
  recommendations: Array<{
    action: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    deadline?: Date;
  }>;
  alternatives: {
    route?: Route;
    schedule?: ScheduleOptimization;
    additionalCost?: number;
  }[];
}

export const shipmentOptimizationSchema = z.object({
  route: z.any(), // Import from routing schema
  rates: z.any(), // Import from rate schema
  risks: z.any(), // Import from risk schema
  schedule: z.any(), // Import from scheduling schema
  summary: z.object({
    confidence: z.number(),
    recommendations: z.array(z.string()),
    warnings: z.array(z.string())
  })
});