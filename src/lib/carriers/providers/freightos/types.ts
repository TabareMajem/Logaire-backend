export interface FreightosRateRequest {
  origin: {
    type: 'port' | 'address';
    code?: string;
    address?: {
      street: string;
      city: string;
      state?: string;
      country: string;
      zipCode?: string;
    };
  };
  destination: {
    type: 'port' | 'address';
    code?: string;
    address?: {
      street: string;
      city: string;
      state?: string;
      country: string;
      zipCode?: string;
    };
  };
  cargo: {
    type: 'FCL' | 'LCL';
    containers?: Array<{
      type: string;
      quantity: number;
    }>;
    packages?: Array<{
      quantity: number;
      length: number;
      width: number;
      height: number;
      weight: number;
    }>;
    totalWeight: number;
    weightUnit: 'KG' | 'LB';
    dangerousGoods: boolean;
    commodity?: string;
  };
  preferences?: {
    carriers?: string[];
    transitTime?: {
      max?: number;
      preferred?: number;
    };
    serviceTypes?: string[];
  };
}

export interface FreightosRateResponse {
  quotes: Array<{
    id: string;
    carrier: {
      code: string;
      name: string;
      scac: string;
    };
    service: {
      type: string;
      name: string;
      transitTime: {
        min: number;
        max: number;
        unit: string;
      };
    };
    routing: {
      origin: FreightosLocation;
      destination: FreightosLocation;
      transshipments?: FreightosLocation[];
    };
    rates: {
      baseRate: {
        amount: number;
        currency: string;
      };
      surcharges: Array<{
        code: string;
        name: string;
        amount: number;
        currency: string;
      }>;
      totalRate: {
        amount: number;
        currency: string;
      };
    };
    validity: {
      start: string;
      end: string;
    };
    availability: {
      equipment: Array<{
        type: string;
        available: number;
      }>;
      space: 'available' | 'limited' | 'waitlist';
    };
  }>;
}

interface FreightosLocation {
  type: 'port' | 'address';
  code?: string;
  name: string;
  country: string;
  coordinates?: [number, number];
  address?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
  };
}