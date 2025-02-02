import { BaseExternalClient } from '../base-client';
import { ExternalAPIConfig } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface CarrierSchedule {
  carrierId: string;
  schedules: Array<{
    vesselId: string;
    route: string;
    departurePort: string;
    arrivalPort: string;
    departureTime: string;
    arrivalTime: string;
    availableSpace: number;
  }>;
}

interface RateQuote {
  carrierId: string;
  rate: number;
  currency: string;
  validUntil: string;
  surcharges: Record<string, number>;
}

export class CarrierAPIClient extends BaseExternalClient {
  constructor(config: ExternalAPIConfig) {
    super(config);
  }

  async getSchedules(
    origin: string,
    destination: string,
    date: string
  ): Promise<CarrierSchedule[]> {
    try {
      const response = await this.request<CarrierSchedule[]>('/schedules', {
        params: { origin, destination, date }
      });
      return response.data;
    } catch (error) {
      ErrorLogger.error('Failed to fetch carrier schedules', error as Error);
      throw error;
    }
  }

  async getRateQuote(
    origin: string,
    destination: string,
    containerType: string,
    weight: number
  ): Promise<RateQuote[]> {
    try {
      const response = await this.request<RateQuote[]>('/rates/quote', {
        method: 'POST',
        body: JSON.stringify({
          origin,
          destination,
          containerType,
          weight
        })
      });
      return response.data;
    } catch (error) {
      ErrorLogger.error('Failed to get rate quote', error as Error);
      throw error;
    }
  }
}