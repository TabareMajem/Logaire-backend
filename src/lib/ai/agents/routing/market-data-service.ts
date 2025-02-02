import { supabase } from '@/lib/supabase/client';
import { MarketConditions } from '../../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class MarketDataService {
  private supabase = supabase;

  async getCurrentConditions(): Promise<MarketConditions> {
    try {
      const { data, error } = await this.supabase
        .from('market_conditions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to fetch market conditions', error as Error);
      throw error;
    }
  }

  async getPortCongestion(portCode: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('port_congestion')
        .select('congestion_level')
        .eq('port_code', portCode)
        .single();

      if (error) throw error;
      return data.congestion_level;
    } catch (error) {
      ErrorLogger.error('Failed to fetch port congestion', error as Error);
      throw error;
    }
  }
}