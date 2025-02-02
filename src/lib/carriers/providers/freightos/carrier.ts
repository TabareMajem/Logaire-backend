import { BaseCarrier } from '../../base-carrier';
import { BookingConfirmation, BookingRequest, Rate, RateRequest } from '../../types';
import { Schedule, ScheduleRequest } from '../../types/schedule';
import { TrackingUpdate } from '../../types/tracking';
import { mapToFreightosRequest, mapFromFreightosResponse } from './mapper';
import { FreightosRateResponse } from './types';

export class FreightosAggregator extends BaseCarrier {
  async getRates(request: RateRequest): Promise<Rate[]> {
    const freightosRequest = mapToFreightosRequest(request);
    
    const response = await this.makeRequest<FreightosRateResponse>(
      '/quotes/search',
      {
        method: 'POST',
        body: JSON.stringify(freightosRequest)
      }
    );

    return mapFromFreightosResponse(response, this.config.code);
  }

  async createBooking(booking: BookingRequest): Promise<BookingConfirmation> {
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