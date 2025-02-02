export interface TrackingRequest {
  referenceType: 'booking' | 'container' | 'bl';
  referenceNumber: string;
}

export interface TrackingUpdate {
  timestamp: Date;
  location: Location;
  status: TrackingStatus;
  description: string;
  nextLocation?: Location;
  estimatedArrival?: Date;
  vessel?: {
    name: string;
    voyage: string;
  };
  container?: {
    number: string;
    type: string;
    seal?: string;
  };
}

export type TrackingStatus =
  | 'booked'
  | 'empty_pickup'
  | 'gate_in'
  | 'loaded'
  | 'departed'
  | 'arrived'
  | 'discharged'
  | 'gate_out'
  | 'delivered'
  | 'empty_return';