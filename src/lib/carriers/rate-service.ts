import { RateRequest, Rate } from './types';
import { CarrierService } from './carrier-service';
import { Cache } from './cache';
import { ErrorLogger } from '@/lib/errors/logger';

export class RateService {
  private cache: Cache;
  private carrierService: CarrierService;

  constructor() {
    this.cache = new Cache();
    this.carrierService = new CarrierService();
  }

  async getRates(request: RateRequest): Promise<Rate[]> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const cachedRates = await this.cache.get<Rate[]>(cacheKey);

      if (cachedRates) {
        return cachedRates;
      }

      const rates = await this.carrierService.getRatesFromAllCarriers(request);
      await this.cache.set(cacheKey, rates, 300); // Cache for 5 minutes
      return rates;
    } catch (error) {
      ErrorLogger.error('Failed to get rates', error as Error);
      throw error;
    }
  }

  private generateCacheKey(request: RateRequest): string {
    return `rates:${JSON.stringify({
      origin: request.origin.code,
      destination: request.destination.code,
      cargoType: request.cargoDetails.type,
      weight: request.cargoDetails.weight,
      equipmentType: request.equipmentType
    })}`;
  }
}