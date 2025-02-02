import { BaseCarrierAdapter } from '../../core/base-adapter';
import { CarrierConfig } from '../../core/types';
import { Rate, RateRequest, BookingRequest, BookingConfirmation } from '../../types';
import { Schedule, ScheduleRequest } from '../../types/schedule';
import { TrackingUpdate } from '../../types/tracking';
import { mapToMscRequest, mapFromMscResponse } from './mapper';
import { MscRateRequest, MscRateResponse } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export class MscAdapter extends BaseCarrierAdapter {
  constructor(config: CarrierConfig) {
    super(config);
  }

  async getRates(request: RateRequest): Promise<Rate[]> {
    try {
      const mscRequest = mapToMscRequest(request);
      const response = await this.makeRequest<MscRateResponse>(
        'rates',
        {
          method: 'POST',
          body: JSON.stringify(mscRequest)
        }
      );

      return mapFromMscResponse(response.data, this.config.id);
    } catch (error) {
      ErrorLogger.error('Failed to get MSC rates', error as Error);
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