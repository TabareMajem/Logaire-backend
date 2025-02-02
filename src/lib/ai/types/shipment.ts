// src/lib/ai/types/shipment.ts -->

export interface Route {
    id: string;
    origin: {
      name: string;
      coordinates: [number, number];
      type: "port" | "warehouse" | "terminal" | "other";
      code: string;
    };
    destination: {
      name: string;
      coordinates: [number, number];
      type: "port" | "warehouse" | "terminal" | "other";
      code: string;
    };
    via: Array<{
      name: string;
      coordinates: [number, number];
      type: "port" | "warehouse" | "terminal" | "other";
      code: string;
    }>;
    estimatedDuration: number;
    estimatedCost: number;
    distance: number;
    carbonEmissions: number;
    risks: Array<{
      type: "weather" | "congestion" | "political" | "operational";  // Changed from string to specific types
      severity: "low" | "medium" | "high";                          // Added
      description: string;                                          // Added
      mitigation?: string;                                         // Added as optional
    }>;
}

export interface Shipment {
    id: string;
    origin: string;
    destination: string;
    route: Route;
    status: 'in_transit' | 'delivered' | 'delayed' | 'canceled' | 'pending';
    schedule: {
      pickupDate: string;
      deliveryDate: string;
    };
    cargoDetails: {
      type: string;
      weight: number;
      volume: number; // Already exists, no changes needed here
    };
  }
  
  
  export interface Disruption {
    id: string;
    type: 'weather' | 'mechanical' | 'logistical' | 'other';
    description: string;
    affectedLocations: string[];
    severity: 'low' | 'medium' | 'high';
    estimatedDelay: number; // in hours
  }
  