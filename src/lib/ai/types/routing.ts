import { z } from 'zod';

export interface Location {
  name: string;
  coordinates: [number, number];
  type: 'port' | 'warehouse' | 'terminal' | 'other';
  code: string;
}

export interface RiskFactor {
  type: 'weather' | 'congestion' | 'political' | 'operational';
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation?: string;
}

export interface RouteConstraints {
  maxTransitTime?: number;
  maxCost?: number;
  requiredStops?: Location[];
  avoidRegions?: string[];
  preferredCarriers?: string[];
  sustainabilityGoals?: {
    maxCarbonEmissions?: number;
    preferGreenCarriers?: boolean;
  };
}

export const locationSchema = z.object({
  name: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  type: z.enum(['port', 'warehouse', 'terminal', 'other'])
});

export const riskFactorSchema = z.object({
  type: z.enum(['weather', 'congestion', 'political', 'operational']),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  mitigation: z.string().optional()
});

export const routeSchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
  via: z.array(locationSchema),
  estimatedDuration: z.number(),
  estimatedCost: z.number(),
  distance: z.number(),
  carbonEmissions: z.number(),
  risks: z.array(riskFactorSchema)
});

export type Route = z.infer<typeof routeSchema>;