import { Rate, RateRequest, BookingRequest, BookingConfirmation } from '../types';
import { Schedule, ScheduleRequest } from '../types/schedule';
import { TrackingUpdate } from '../types/tracking';

export interface CarrierAdapter {
  getRates(request: RateRequest): Promise<Rate[]>;
  createBooking(request: BookingRequest): Promise<BookingConfirmation>;
  trackShipment(reference: string): Promise<TrackingUpdate[]>;
  getSchedules(request: ScheduleRequest): Promise<Schedule[]>;
}

export interface CarrierConfig {
  id: string;
  name: string;
  credentials: {
    apiKey?: string;
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
  };
  endpoints: {
    rates: string;
    booking: string;
    tracking: string;
    schedules: string;
  };
  features: {
    rateQuotes: boolean;
    booking: boolean;
    tracking: boolean;
    schedules: boolean;
  };
}

export interface CarrierResponse<T> {
  data: T;
  raw?: unknown;
  metadata?: Record<string, unknown>;
}