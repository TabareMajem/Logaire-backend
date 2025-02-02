export interface MscRateRequest {
  portOfLoading: string;
  portOfDischarge: string;
  equipmentType: string;
  cargoWeight: number;
  cargoType: string;
  preferredDate?: string;
  specialRequirements?: {
    reefer?: boolean;
    hazardous?: boolean;
    temperature?: {
      min: number;
      max: number;
      unit: string;
    };
  };
}

export interface MscRateResponse {
  quotations: Array<{
    serviceLevel: string;
    baseRate: {
      value: number;
      currency: string;
    };
    additionalCharges: Array<{
      type: string;
      value: number;
    }>;
    validityPeriod: {
      from: string;
      to: string;
    };
    estimatedTransitTime: number;
    vesselSchedule?: {
      vesselName: string;
      departureDate: string;
      arrivalDate: string;
    };
  }>;
}