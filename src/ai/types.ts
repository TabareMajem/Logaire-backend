export type DocumentType = 'bill_of_lading' | 'commercial_invoice' | 'packing_list';

export interface DocumentAnalysis {
  id: string;
  type: DocumentType;
  content: Record<string, any>;
  confidence: number;
  metadata: Record<string, any>;
}

export interface RoutingOptions {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  constraints: {
    maxStops?: number;
    avoidTolls?: boolean;
    preferredCarriers?: string[];
  };
}

export interface Route {
  id: string;
  waypoints: RouteWaypoint[];
  distance: number;
  duration: number;
  cost: number;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  type: 'pickup' | 'delivery' | 'stop';
  estimatedTime: string;
}

export interface RateOptions {
  origin: string;
  destination: string;
  cargo: {
    weight: number;
    volume: number;
    type: string;
  };
  service: string;
}

export interface RateEstimate {
  carrier: string;
  service: string;
  cost: number;
  currency: string;
  transitTime: {
    min: number;
    max: number;
    unit: 'days' | 'hours';
  };
}