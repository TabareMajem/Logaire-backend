export interface MaerskRateRequest {
  origin: {
    unlocode: string;
    facility?: string;
  };
  destination: {
    unlocode: string;
    facility?: string;
  };
  containerDetails: {
    equipmentSize: string;
    equipmentType: string;
    quantity: number;
  }[];
  cargoDetails: {
    weight: number;
    weightUnit: 'KGS' | 'LBS';
    commodity: string;
    hsCode?: string;
  };
  scheduledDate: string;
}

export interface MaerskRateResponse {
  quotes: Array<{
    serviceType: string;
    price: {
      amount: number;
      currency: string;
      charges: Record<string, number>;
    };
    validUntil: string;
    transitTime: {
      duration: number;
      unit: string;
    };
    routing: {
      vessel: string;
      voyage: string;
      departureDate: string;
      arrivalDate: string;
    };
  }>;
}