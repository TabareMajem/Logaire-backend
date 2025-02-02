// src/lib/ai/types/index.ts -->

import { z } from 'zod';


// Environmental Data interface
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

// Performance Metrics interface
export interface PerformanceMetrics {
  successRate: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
  lastUpdated: Date;
}

// Optional: Add Zod schemas for validation
export const environmentalDataSchema = z.object({
  carbonEmissions: z.object({
    current: z.number(),
    target: z.number(),
    trend: z.enum(['increasing', 'decreasing', 'stable'])
  }),
  sustainabilityScore: z.number(),
  environmentalRisks: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    probability: z.number(),
    impact: z.number()
  })),
  lastUpdated: z.date()
});

export const performanceMetricsSchema = z.object({
  successRate: z.number(),
  averageLatency: z.number(),
  errorRate: z.number(),
  throughput: z.number(),
  lastUpdated: z.date()
});

export type ContextKey = 
  | 'userId' 
  | 'projectId' 
  | 'teamId' 
  | 'organizationId' 
  | 'settings'
  | 'preferences'
  | 'metadata'
  | 'documentContent'
  | 'documentType'
  | 'shipmentDetails'

export interface AIAgentResponse<T> {
  data: T;
  confidence: number;
  reasoning: string[];
  alternatives?: T[];
}

export interface AIAgentContext {
  companyId: string;
  userId: string;
  timestamp: Date;
  marketConditions?: MarketConditions;
  preferences?: UserPreferences;
  config?: Record<string, unknown>; // Or specify a more precise type for `config`
}

export interface MarketConditions {
  fuelPrices: number;
  portCongestion: Record<string, number>;
  weatherConditions: Record<string, string>;
  lastUpdated: Date;
}

export interface UserPreferences {
  preferredCarriers?: string[];
  costSensitivity?: 'low' | 'medium' | 'high';
  sustainabilityFocus?: boolean;
  transitTimePreference?: 'fastest' | 'balanced' | 'economical';
}

export const marketConditionsSchema = z.object({
  fuelPrices: z.number(),
  portCongestion: z.record(z.number()),
  weatherConditions: z.record(z.string()),
  lastUpdated: z.date()
});

export const userPreferencesSchema = z.object({
  preferredCarriers: z.array(z.string()).optional(),
  costSensitivity: z.enum(['low', 'medium', 'high']).optional(),
  sustainabilityFocus: z.boolean().optional(),
  transitTimePreference: z.enum(['fastest', 'balanced', 'economical']).optional()
});

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  timestamp: string;
}