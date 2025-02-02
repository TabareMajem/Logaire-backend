import { CargoDetails } from "../types";

export interface BookingRequest {
  origin: Location;
  destination: Location;
  cargo: CargoDetails;
  equipment: {
    type: string;
    quantity: number;
  };
  schedule: {
    departureDate: Date;
    arrivalDate?: Date;
  };
  references?: {
    customerReference?: string;
    poNumber?: string;
  };
  parties: {
    shipper: Party;
    consignee: Party;
    notifyParty?: Party;
  };
}

export interface BookingConfirmation {
  bookingNumber: string;
  carrier: string;
  status: BookingStatus;
  equipment: {
    type: string;
    quantity: number;
    confirmed: number;
  };
  schedule: {
    vessel?: string;
    voyage?: string;
    departureDate: Date;
    arrivalDate: Date;
    cutoffDate: Date;
  };
  documents?: {
    bookingConfirmation?: string;
    shippingInstructions?: string;
  };
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled';

interface Party {
  name: string;
  address: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
}