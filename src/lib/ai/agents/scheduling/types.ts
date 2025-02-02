export interface ScheduleRequest {
  shipmentId: string;
  origin: {
    location: string;
    earliestDeparture?: Date;
  };
  destination: {
    location: string;
    latestArrival?: Date;
  };
  constraints?: {
    maxTransitTime?: number;
    preferredCarriers?: string[];
    requiredStops?: string[];
  };
}

export interface OptimizedSchedule {
  departureWindow: {
    earliest: Date;
    latest: Date;
  };
  arrivalWindow: {
    earliest: Date;
    latest: Date;
  };
  transitTime: number;
  reliability: number;
  carriers: Array<{
    name: string;
    reliability: number;
    schedule: {
      departure: Date;
      arrival: Date;
    };
  }>;
}