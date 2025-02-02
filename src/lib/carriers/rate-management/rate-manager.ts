import { RateRequest, Rate } from '../types';
import { RateCache } from './rate-cache';
import { RateValidator } from './rate-validator';
import { RateAggregator } from './rate-aggregator';
import { ErrorLogger } from '@/lib/errors/logger';

export class RateManager {
  private cache: RateCache;
  private validator: RateValidator;
  private aggregator: RateAggregator;

  constructor() {
    this.cache = new RateCache();
    this.validator = new RateValidator();
    this.aggregator = new RateAggregator();
  }

  async getRates(request: RateRequest): Promise<Rate[]> {
    try {
      // Validate request
      this.validator.validateRequest(request);

      // Check cache first
      const cachedRates = await this.cache.getRates(request);
      if (cachedRates) {
        return cachedRates;
      }

      // Fetch fresh rates
      const freshRates = await this.aggregator.getRates(request);
      
      // Cache the results
      await this.cache.setRates(request, freshRates);

      return freshRates;
    } catch (error) {
      ErrorLogger.error('Failed to get rates', error as Error);
      throw error;
    }
  }

  async invalidateCache(request: RateRequest): Promise<void> {
    try {
      await this.cache.invalidate(request);
    } catch (error) {
      ErrorLogger.error('Failed to invalidate rate cache', error as Error);
      throw error;
    }
  }
}