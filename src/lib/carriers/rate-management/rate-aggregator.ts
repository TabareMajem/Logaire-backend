import { RateRequest, Rate } from '../types';
import { CarrierService } from '../carrier-service';
import { ErrorLogger } from '@/lib/errors/logger';

export class RateAggregator {
  private carrierService: CarrierService;

  constructor() {
    this.carrierService = new CarrierService();
  }

  async getRates(request: RateRequest): Promise<Rate[]> {
    try {
      const rates = await this.carrierService.getRatesFromAllCarriers(request);
      return this.processRates(rates);
    } catch (error) {
      ErrorLogger.error('Failed to aggregate rates', error as Error);
      throw error;
    }
  }

  private processRates(rates: Rate[]): Rate[] {
    // Remove duplicates
    const uniqueRates = this.deduplicateRates(rates);
    
    // Sort by price
    const sortedRates = this.sortRates(uniqueRates);
    
    // Enrich with additional data
    return this.enrichRates(sortedRates);
  }

  private deduplicateRates(rates: Rate[]): Rate[] {
    const seen = new Set<string>();
    return rates.filter(rate => {
      const key = `${rate.carrierId}-${rate.serviceType}-${rate.price.amount}-${rate.price.currency}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortRates(rates: Rate[]): Rate[] {
    return [...rates].sort((a, b) => {
      // First by price
      if (a.price.currency === b.price.currency) {
        return a.price.amount - b.price.amount;
      }
      // Then by transit time
      return a.transitTime.min - b.transitTime.min;
    });
  }

  private enrichRates(rates: Rate[]): Rate[] {
    return rates.map(rate => ({
      ...rate,
      // Add market analysis
      marketAnalysis: {
        averageMarketRate: this.calculateAverageRate(rates, rate.price.currency),
        pricePosition: this.calculatePricePosition(rate, rates),
        availability: rate.availability || 1
      }
    }));
  }

  private calculateAverageRate(rates: Rate[], currency: string): number {
    const sameCurrencyRates = rates.filter(r => r.price.currency === currency);
    if (sameCurrencyRates.length === 0) return 0;
    
    const sum = sameCurrencyRates.reduce((acc, r) => acc + r.price.amount, 0);
    return sum / sameCurrencyRates.length;
  }

  private calculatePricePosition(rate: Rate, allRates: Rate[]): string {
    const sameCurrencyRates = allRates.filter(r => r.price.currency === rate.price.currency);
    const position = sameCurrencyRates.findIndex(r => r === rate) + 1;
    const total = sameCurrencyRates.length;
    
    if (position <= Math.ceil(total * 0.33)) return 'low';
    if (position <= Math.ceil(total * 0.66)) return 'medium';
    return 'high';
  }
}