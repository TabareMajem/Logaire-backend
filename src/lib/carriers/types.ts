export interface Location {
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

export interface CargoDetails {
  containerType?: string;
  containerSize?: string;
  quantity?: number;
  packages?: Array<{
    quantity: number;
    length: number;
    width: number;
    height: number;
    weight: number;
  }>;
  weight: number;
  weightUnit: 'KG' | 'LB';
  commodity?: string;
  hazardous?: boolean;
  temperature?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
}

export interface RateRequest {
  origin: Location;
  destination: Location;
  cargoDetails: CargoDetails;
  departureDate?: Date;
  preferences?: {
    carriers?: string[];
    transitTime?: {
      max?: number;
      preferred?: number;
    };
    serviceTypes?: string[];
  };
}

export interface Rate {
  id?: string;
  carrierId: string;
  aggregatorId?: string;
  serviceType: string;
  serviceName?: string;
  price: {
    amount: number;
    currency: string;
    breakdown?: Record<string, {
      amount: number;
      currency: string;
    }>;
  };
  transitTime: {
    min: number;
    max: number;
    unit: 'days' | 'hours';
  };
  validity: {
    start: Date;
    end: Date;
  };
  schedule?: {
    departure: Date;
    arrival: Date;
    vessel?: string;
  };
  availability?: number;
}

export interface BookingRequest {
  rateId?: string;
  shipper: Party;
  consignee: Party;
  notifyParty?: Party;
  cargo: CargoDetails;
  references?: {
    customerReference?: string;
    poNumber?: string;
  };
  instructions?: string;
}

export interface BookingConfirmation {
  bookingNumber: string;
  carrier: string;
  status: 'confirmed' | 'pending' | 'rejected';
  details: {
    equipment: {
      type: string;
      quantity: number;
    };
    schedule: {
      departure: Date;
      arrival: Date;
      vessel?: string;
      voyage?: string;
    };
    documents?: {
      bookingConfirmation?: string;
      shippingInstructions?: string;
    };
  };
}

interface Party {
  name: string;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
  };
  contact: {
    name?: string;
    email: string;
    phone?: string;
  };
  taxId?: string;
}