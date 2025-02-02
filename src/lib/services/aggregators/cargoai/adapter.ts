import { BaseCarrierAdapter } from '@/lib/carriers/core/base-adapter';
import { CarrierConfig } from '@/lib/carriers/core/types';
import { BookingConfirmation, BookingRequest, Rate, RateRequest } from '@/lib/carriers/types';
import { CargoAIClient } from './api-client';
import { mapToCargoAIRequest, mapFromCargoAIResponse } from './mapper';
import { ErrorLogger } from '@/lib/errors/logger';
import { Schedule, ScheduleRequest } from '@/lib/carriers/types/schedule';
import { TrackingUpdate } from '@/lib/carriers/types/tracking';

export class CargoAIAdapter extends BaseCarrierAdapter {
  private client: CargoAIClient;

  constructor(config: CarrierConfig) {
    super(config);
    this.client = new CargoAIClient({
      apiKey: config.credentials.apiKey!,
      apiSecret: config.credentials.clientSecret!,
      baseUrl: config.endpoints.rates,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    });
  }

  async getRates(request: RateRequest): Promise<Rate[]> {
    try {
      const cargoAIRequest = mapToCargoAIRequest(request);
      const rates = await this.client.searchRates(cargoAIRequest);
      return mapFromCargoAIResponse(rates, this.config.id);
    } catch (error) {
      ErrorLogger.error('Failed to get CargoAI rates', error as Error);
      throw error;
    }
  }

  async createBooking(request: BookingRequest): Promise<BookingConfirmation> {
    // Implementation
    throw new Error('Not implemented');
  }

  async trackShipment(reference: string): Promise<TrackingUpdate[]> {
    // Implementation
    throw new Error('Not implemented');
  }

  async getSchedules(request: ScheduleRequest): Promise<Schedule[]> {
    // Implementation
    throw new Error('Not implemented');
  }
}