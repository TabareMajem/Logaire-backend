// src/lib/ai/types/optimization.ts -->
 
import { Route } from '..';
import { RateResponse } from '../agents/rate/types';
import { RiskResponse } from '../agents/risk/types';
import { RateRecommendation } from './rate';
import { RiskAssessment } from './risk';
import { ScheduleOptimization } from './scheduling';
import { Location } from '..';

export interface ShipmentDetails {
  origin: Location;
  destination: Location;
  constraints: {
    maxCost?: number;
    maxDuration?: number;
    preferredRouteType?: string[];
    avoidZones?: string[];
  };
  rateConstraints: {
    maxRate?: number;
    preferredCarriers?: string[];
    serviceLevel?: string;
  };
  scheduleConstraints: {
    earliestPickup?: Date;
    latestDelivery?: Date;
    preferredPickupTimes?: string[];
    preferredDeliveryTimes?: string[];
  };
  cargoDetails: {
    type: string;
    weight: number;
    volume: number;
    hazmatClass?: string;
    temperatureRequirements?: {
      min: number;
      max: number;
    };
  };
}

export interface OptimizationRecommendations {
  route: Route
  rate: RateResponse;
  risk: RiskResponse;
//   rate: {
//     data: RateRecommendation;
//     confidence: number;
//   };
//   risk: {
//     data: RiskAssessment;
//     confidence: number;
//   };
  schedule: {
    data: ScheduleOptimization;
    confidence: number;
  };
}

export interface DisruptionUpdates {
  routeUpdate: {
    alternativeRoutes: Route[];
    estimatedDelays: number[];
    confidenceScores: number[];
  };
  rateImpact: {
    predictedChanges: {
      amount: number;
      confidence: number;
      validUntil: Date;
    }[];
    alternativeRates: RateRecommendation[];
  };
  riskUpdate: {
    updatedAssessment: RiskAssessment;
    newRisks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  scheduleRecovery: {
    proposedSchedules: ScheduleOptimization[];
    impactAnalysis: {
      delayDuration: number;
      downstreamImpacts: string[];
      recoveryOptions: string[];
    };
  };
}