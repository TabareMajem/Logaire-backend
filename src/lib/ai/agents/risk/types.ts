// src/lib/ai/agents/risk/types.ts -->

import { Route } from "../..";
import { RiskAssessment } from "../risk-assessment/types";

export interface RiskRequest {
  route: Route;
  cargoDetails: {
    type: string;
    value: number;
    hazardous: boolean;
  };
  constraints?: {
    maxRiskLevel?: 'low' | 'medium' | 'high';
    requiredInsurance?: boolean;
    specialHandling?: string[];
  };
}

export interface RiskResponse {
  data: RiskAssessment;
  overallRisk: RiskLevel;
  factors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  recommendations: string[];
  confidence: number;
}

export interface RiskFactor {
  type: RiskType;
  severity: RiskLevel;
  likelihood: number;
  impact: string;
  location?: string;
  timeframe?: {
    start: string;
    end: string;
  };
}

export interface MitigationStrategy {
  risk: RiskType;
  actions: string[];
  cost: number;
  effectiveness: number;
  timeToImplement: string;
}

export type RiskType = 
  | 'weather'
  | 'political'
  | 'security'
  | 'operational'
  | 'financial'
  | 'compliance';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';