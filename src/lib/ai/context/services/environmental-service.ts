// src/lib/ai/context/services/environmental-service.ts -->

import { supabase } from '@/lib/supabase/client';
import { EnvironmentalData } from '../../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class EnvironmentalService {
  private readonly supabase = supabase;

  async getEnvironmentalData(): Promise<EnvironmentalData> {
    try {
      const { data, error } = await this.supabase
        .from('environmental_conditions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        carbonEmissions: {
          current: data.current_emissions,
          target: data.target_emissions,
          trend: data.emissions_trend
        },
        sustainabilityScore: data.sustainability_score,
        environmentalRisks: data.environmental_risks,
        lastUpdated: new Date(data.timestamp)
      };
    } catch (error) {
      ErrorLogger.error('Failed to fetch environmental data', error as Error);
      throw error;
    }
  }
}