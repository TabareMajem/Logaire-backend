import { CarrierAdapter } from './types';
import { RateCache } from '../cache';
import { CarrierError } from '../errors';
import { RateRequest, Rate, BookingRequest, BookingConfirmation } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class CarrierHub {
  private carriers: Map<string, CarrierAdapter>;
  private rateCache: RateCache;

  constructor() {
    this.carriers = new Map();
    this.rateCache = new RateCache();
  }

  // Return all carriers
  getCarriers(): Map<string, CarrierAdapter> {
    return this.carriers;
  }

  registerCarrier(id: string, adapter: CarrierAdapter): void {
    this.carriers.set(id, adapter);
  }

  async getRates(request: RateRequest): Promise<Rate[]> {
    try {
      // Check cache first
      const cachedRates = await this.rateCache.getRates(request);
      if (cachedRates) return cachedRates;

      // Fetch rates from all carriers in parallel
      const ratePromises = Array.from(this.carriers.values())
        .map(carrier => carrier.getRates(request)
          .catch(error => {
            ErrorLogger.error(`Failed to get rates from carrier`, error as Error);
            return [];
          }));

      const rates = await Promise.all(ratePromises);
      const flattenedRates = this.normalizeAndFilterRates(rates.flat());

      // Cache the results
      await this.rateCache.setRates(request, flattenedRates);

      return flattenedRates;
    } catch (error) {
      ErrorLogger.error('Failed to get rates', error as Error);
      throw error;
    }
  }

  async createBooking(carrierId: string, request: BookingRequest): Promise<BookingConfirmation> {
    const carrier = this.carriers.get(carrierId);
    if (!carrier) {
      throw new CarrierError('Carrier not found', 'INVALID_CARRIER', carrierId);
    }

    try {
      return await carrier.createBooking(request);
    } catch (error) {
      ErrorLogger.error(`Failed to create booking with carrier ${carrierId}`, error as Error);
      throw error;
    }
  }

  private normalizeAndFilterRates(rates: Rate[]): Rate[] {
    return rates
      .filter(rate => this.isValidRate(rate))
      .map(rate => this.normalizeRate(rate));
  }

  private isValidRate(rate: Rate): boolean {
    return (
      rate.price.amount > 0 &&
      rate.validity.end > new Date() &&
      rate.transitTime.min > 0
    );
  }

  private normalizeRate(rate: Rate): Rate {
    return {
      ...rate,
      transitTime: {
        min: Math.ceil(rate.transitTime.min),
        max: Math.ceil(rate.transitTime.max || rate.transitTime.min * 1.2),
        unit: rate.transitTime.unit
      },
      availability: rate.availability || 1
    };
  }
}