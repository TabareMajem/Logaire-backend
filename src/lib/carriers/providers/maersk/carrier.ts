import { BaseCarrier } from '../../base-carrier';
import { BookingConfirmation, BookingRequest, Rate, RateRequest } from '../../types';
import { Schedule, ScheduleRequest } from '../../types/schedule';
import { TrackingUpdate } from '../../types/tracking';
import { mapToMaerskRequest, mapFromMaerskResponse } from './mapper';
import { MaerskRateResponse } from './types';

export class MaerskCarrier extends BaseCarrier {
  async getRates(request: RateRequest): Promise<Rate[]> {
    const maerskRequest = mapToMaerskRequest(request);
    
    const response = await this.makeRequest<MaerskRateResponse>(
      '/rates/spot',
      {
        method: 'POST',
        body: JSON.stringify(maerskRequest)
      }
    );

    return mapFromMaerskResponse(response, this.config.code);
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