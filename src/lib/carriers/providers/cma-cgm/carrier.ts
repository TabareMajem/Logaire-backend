import { BaseCarrier } from '../../base-carrier';
import { BookingConfirmation, BookingRequest, Rate, RateRequest } from '../../types';
import { Schedule, ScheduleRequest } from '../../types/schedule';
import { TrackingUpdate } from '../../types/tracking';
import { mapToCmaCgmRequest, mapFromCmaCgmResponse } from './mapper';
import { CmaCgmRateResponse } from './types';

export class CmaCgmCarrier extends BaseCarrier {
  async getRates(request: RateRequest): Promise<Rate[]> {
    const cmaCgmRequest = mapToCmaCgmRequest(request);
    
    const response = await this.makeRequest<CmaCgmRateResponse>(
      '/rates',
      {
        method: 'POST',
        body: JSON.stringify(cmaCgmRequest)
      }
    );

    return mapFromCmaCgmResponse(response, this.config.code);
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