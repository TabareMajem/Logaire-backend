import { AIContext, AIResponse } from '../core/types';

// Common optimization request interface
export interface BaseOptimizationRequest {
  shipmentId: string;
  constraints?: {
    maxCost?: number;
    maxTime?: number;
    preferences?: string[];
  };
}

// Common optimization result interface
export interface BaseOptimizationResult {
  confidence: number;
  impact: {
    cost: number;
    time: number;
  };
}

// Route optimization specific types
export interface RouteOptimizationRequest extends BaseOptimizationRequest {
  origin: string;
  destination: string;
  waypoints?: string[];
}

export interface RouteOptimizationResult extends BaseOptimizationResult {
  optimizedRoute: {
    path: string[];
    estimatedTime: number;
    estimatedCost: number;
  };
}

// Define interfaces for other optimization types...
export interface RateOptimizationResult extends BaseOptimizationResult {
  optimizedRates: {
    service: string;
    cost: number;
  }[];
}

// Common interface for all optimization agents
export interface OptimizationAgent {
  performOptimization(request: BaseOptimizationRequest): Promise<AIResponse<BaseOptimizationResult>>;
}