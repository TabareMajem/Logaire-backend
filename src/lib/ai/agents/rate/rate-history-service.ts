import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { ErrorLogger } from '@/lib/errors/logger';

interface RateHistory {
  averageRate: number;
  minRate: number;
  maxRate: number;
  volatility: number;
  seasonalFactors: Record<string, number>;
}

export class RateHistoryService {
  private supabase = supabase;

  async getRateHistory(route: Route): Promise<RateHistory> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_rate_history', {
          origin_location: route.origin.name,
          destination_location: route.destination.name,
          lookback_days: 365
        });

      if (error) throw error;
      return this.processHistoricalData(data);
    } catch (error) {
      ErrorLogger.error('Failed to fetch rate history', error as Error);
      throw error;
    }
  }

  private processHistoricalData(data: any[]): RateHistory {
    const rates = data.map(r => r.rate);
    const seasonalFactors = this.calculateSeasonalFactors(data);

    return {
      averageRate: this.calculateAverage(rates),
      minRate: Math.min(...rates),
      maxRate: Math.max(...rates),
      volatility: this.calculateVolatility(rates),
      seasonalFactors
    };
  }

  private calculateAverage(rates: number[]): number {
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  private calculateVolatility(rates: number[]): number {
    const avg = this.calculateAverage(rates);
    const variance = rates.reduce((sum, rate) => {
      const diff = rate - avg;
      return sum + (diff * diff);
    }, 0) / rates.length;
    return Math.sqrt(variance);
  }

  private calculateSeasonalFactors(data: any[]): Record<string, number> {
    // Group rates by month and calculate average deviation from mean
    const monthlyRates: Record<string, number[]> = {};
    const overallAvg = this.calculateAverage(data.map(d => d.rate));

    data.forEach(d => {
      const month = new Date(d.date).getMonth();
      if (!monthlyRates[month]) monthlyRates[month] = [];
      monthlyRates[month].push(d.rate);
    });

    return Object.entries(monthlyRates).reduce((acc, [month, rates]) => {
      const monthlyAvg = this.calculateAverage(rates);
      return {
        ...acc,
        [month]: monthlyAvg / overallAvg
      };
    }, {});
  }
}