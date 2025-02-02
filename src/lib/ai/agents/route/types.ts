export interface RouteRequest {
  origin: {
    code: string;
    coordinates: [number, number];
  };
  destination: {
    code: string;
    coordinates: [number, number];
  };
  constraints?: {
    maxTransitTime?: number;
    maxStops?: number;
    avoidRegions?: string[];
    preferredCarriers?: string[];
    sustainabilityGoals?: {
      maxCarbonEmissions?: number;
      preferGreenCarriers?: boolean;
    };
  };
}

export interface RouteResponse {
  recommendedRoute: Route;
  alternatives: RouteAlternative[];
  analysis: {
    transitTime: number;
    reliability: number;
    carbonEmissions: number;
    riskFactors: RiskFactor[];
  };
}

export interface Route {
  segments: RouteSegment[];
  totalDistance: number;
  totalTime: number;
  totalCost: number;
  carbonEmissions: number;
}

export interface RouteSegment {
  origin: string;
  destination: string;
  carrier: string;
  mode: 'sea' | 'air' | 'rail' | 'road';
  distance: number;
  duration: number;
  schedule?: {
    departure: string;
    arrival: string;
  };
}

export interface RouteAlternative {
  route: Route;
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  comparison: {
    timeDiff: number;
    costDiff: number;
    emissionsDiff: number;
  };
}

export interface RiskFactor {
  type: 'weather' | 'political' | 'operational';
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation?: string;
}