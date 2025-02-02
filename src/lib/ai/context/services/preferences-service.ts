import { supabase } from '@/lib/supabase/client';
import { UserPreferences } from '../../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class PreferencesService {
  private readonly supabase = supabase;

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        preferredCarriers: data.preferred_carriers,
        costSensitivity: data.cost_sensitivity,
        sustainabilityFocus: data.sustainability_focus,
        transitTimePreference: data.transit_time_preference
      };
    } catch (error) {
      ErrorLogger.error('Failed to fetch user preferences', error as Error);
      throw error;
    }
  }
}