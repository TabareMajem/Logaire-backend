import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { EventEmitter } from 'events';

interface MonitoringPreferences {
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number;
  defaultTimeRange: string;
  defaultMetrics: string[];
  notifications: {
    email: boolean;
    browser: boolean;
    slack: boolean;
  };
  dashboardLayout: {
    panels: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
    }>;
  };
}

class UserPreferencesService extends EventEmitter {
  private static instance: UserPreferencesService;
  private preferences: Map<string, MonitoringPreferences> = new Map();

  private constructor() {
    super();
  }

  static getInstance(): UserPreferencesService {
    if (!this.instance) {
      this.instance = new UserPreferencesService();
    }
    return this.instance;
  }

  async loadPreferences(userId: string): Promise<MonitoringPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('monitoring_config')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const preferences = data.monitoring_config as MonitoringPreferences;
      this.preferences.set(userId, preferences);
      return preferences;
    } catch (error) {
      ErrorLogger.error('Failed to load user preferences', error as Error);
      throw error;
    }
  }

  async updatePreferences(
    userId: string,
    updates: Partial<MonitoringPreferences>
  ): Promise<MonitoringPreferences> {
    try {
      const current = this.preferences.get(userId) || await this.loadPreferences(userId);
      const updated = { ...current, ...updates };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          monitoring_config: updated
        });

      if (error) throw error;

      this.preferences.set(userId, updated);
      this.emit('preferencesUpdated', { userId, preferences: updated });
      return updated;
    } catch (error) {
      ErrorLogger.error('Failed to update user preferences', error as Error);
      throw error;
    }
  }

  getPreferences(userId: string): MonitoringPreferences | undefined {
    return this.preferences.get(userId);
  }

  onPreferencesUpdated(
    callback: (event: { userId: string; preferences: MonitoringPreferences }) => void
  ): () => void {
    this.on('preferencesUpdated', callback);
    return () => this.off('preferencesUpdated', callback);
  }
}

export const userPreferencesService = UserPreferencesService.getInstance(); 