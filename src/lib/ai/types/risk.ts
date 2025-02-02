import { z } from 'zod';
import { Location } from './routing';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 'weather' | 'political' | 'operational' | 'financial' | 'security';

export interface RiskFactor {
  category: RiskCategory;
  severity: RiskSeverity;
  likelihood: number; // 0-1
  impact: string;
  mitigation: string[];
  location?: Location;
  timeframe?: {
    start: Date;
    end: Date;
  };
}

export interface RiskAssessment {
  overallRisk: RiskSeverity;
  factors: RiskFactor[];
  recommendations: string[];
  contingencyPlans: Array<{
    trigger: string;
    actions: string[];
    estimatedCost?: number;
  }>;
}

export const riskAssessmentSchema = z.object({
  overallRisk: z.enum(['low', 'medium', 'high', 'critical']),
  factors: z.array(z.object({
    category: z.enum(['weather', 'political', 'operational', 'financial', 'security']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    likelihood: z.number().min(0).max(1),
    impact: z.string(),
    mitigation: z.array(z.string()),
    location: z.object({
      name: z.string(),
      coordinates: z.tuple([z.number(), z.number()]),
      type: z.string()
    }).optional(),
    timeframe: z.object({
      start: z.date(),
      end: z.date()
    }).optional()
  })),
  recommendations: z.array(z.string()),
  contingencyPlans: z.array(z.object({
    trigger: z.string(),
    actions: z.array(z.string()),
    estimatedCost: z.number().optional()
  }))
});