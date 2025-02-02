export interface DeliveryRequest {
  deliveries: Array<{
    id: string;
    location: {
      address: string;
      coordinates: [number, number];
    };
    timeWindow: {
      start: Date;
      end: Date;
    };
    volume: number;
    weight: number;
    priority: 'high' | 'medium' | 'low';
    specialRequirements?: string[];
  }>;
  fleet: Array<{
    id: string;
    capacity: {
      volume: number;
      weight: number;
    };
    availability: {
      start: Date;
      end: Date;
    };
    restrictions?: string[];
  }>;
  constraints: {
    maxRoutes?: number;
    maxDuration?: number;
    maxDistance?: number;
  };
}

export interface DeliveryPlan {
  routes: Array<{
    vehicleId: string;
    sequence: Array<{
      deliveryId: string;
      estimatedArrival: Date;
      estimatedDuration: number;
    }>;
    metrics: {
      totalDistance: number;
      totalDuration: number;
      utilization: number;
    };
  }>;
  schedule: {
    optimization: number;
    conflicts: string[];
    buffers: Record<string, number>;
  };
  contingencies: Array<{
    trigger: string;
    action: string;
    impact: {
      time: number;
      cost: number;
    };
  }>;
  kpis: {
    onTimeDelivery: number;
    fleetUtilization: number;
    costPerDelivery: number;
  };
}