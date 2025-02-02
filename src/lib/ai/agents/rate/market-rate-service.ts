import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { ErrorLogger } from '@/lib/errors/logger';
import { MarketFactors, MarketRates, TrendAnalysis } from './types';

export class MarketRateService {
  private supabase = supabase;

  async getCurrentRates(route: Route): Promise<MarketRates> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_market_rates', {
          origin_location: route.origin.name,
          destination_location: route.destination.name
        });

      if (error) throw error;
      return this.processRateData(data);
    } catch (error) {
      ErrorLogger.error('Failed to fetch market rates', error as Error);
      throw error;
    }
  }

  async getMarketFactors(): Promise<MarketFactors> {
    try {
      const { data, error } = await this.supabase
        .from('market_factors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to fetch market factors', error as Error);
      throw error;
    }
  }

  private processRateData(data: any[]): MarketRates {
    return {
      averageRate: this.calculateAverageRate(data),
      rateRange: this.calculateRateRange(data),
      trendAnalysis: this.analyzeTrends(data),
      lastUpdated: new Date()
    };
  }

  private calculateAverageRate(data: any[]): number {
    return data.reduce((sum, rate) => sum + rate.amount, 0) / data.length;
  }

  private calculateRateRange(data: any[]): { min: number; max: number } {
    const rates = data.map(r => r.amount);
    return {
      min: Math.min(...rates),
      max: Math.max(...rates)
    };
  }

  private analyzeTrends(data: any[]): TrendAnalysis {
    // Implementation
    return {
      direction: 'stable',
      strength: 'medium',
      factors: []
    };
  }
}