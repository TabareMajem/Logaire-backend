export interface CmaCgmRateRequest {
  origin: {
    code: string;
    terminal?: string;
  };
  destination: {
    code: string;
    terminal?: string;
  };
  equipment: {
    type: string;
    size: string;
    quantity: number;
  };
  cargo: {
    weight: number;
    weightUnit: string;
    type: string;
    dangerous?: boolean;
    temperature?: {
      value: number;
      unit: string;
    };
  };
  departureDate?: string;
}

export interface CmaCgmRateResponse {
  rates: Array<{
    service: string;
    amount: number;
    currencyCode: string;
    surcharges: Array<{
      code: string;
      amount: number;
    }>;
    validityEnd: string;
    transitDays: number;
    schedule: {
      etd: string;
      eta: string;
      vessel: string;
    };
  }>;
}