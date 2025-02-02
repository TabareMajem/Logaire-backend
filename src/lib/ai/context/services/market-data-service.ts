import { supabase } from '@/lib/supabase/client';
import { MarketConditions } from '../../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class MarketDataService {
  private readonly supabase = supabase;

  async getCurrentConditions(): Promise<MarketConditions> {
    try {
      const { data, error } = await this.supabase
        .from('market_conditions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        fuelPrices: data.fuel_prices,
        portCongestion: data.port_congestion,
        weatherConditions: data.weather_conditions,
        lastUpdated: new Date(data.timestamp)
      };
    } catch (error) {
      ErrorLogger.error('Failed to fetch market conditions', error as Error);
      throw error;
    }
  }
}