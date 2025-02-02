import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { MonitoringConfig } from '@/types/monitoring';
import { EventEmitter } from 'events';

interface ConfigChangeEvent {
  previous: MonitoringConfig;
  current: MonitoringConfig;
  changedBy: string;
}

class MonitoringConfigService extends EventEmitter {
  private static instance: MonitoringConfigService;
  private currentConfig: MonitoringConfig | null = null;
  private configId: string | null = null;

  private constructor() {
    super();
    this.loadConfig();
  }

  static getInstance(): MonitoringConfigService {
    if (!this.instance) {
      this.instance = new MonitoringConfigService();
    }
    return this.instance;
  }

  private async loadConfig(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('monitoring_config')
        .select('*')
        .single();

      if (error) throw error;

      this.configId = data.id;
      this.currentConfig = {
        metrics: data.metrics_config,
        alerts: data.alerts_config
      };
    } catch (error) {
      ErrorLogger.error('Failed to load monitoring configuration', error as Error);
      throw error;
    }
  }

  async updateConfig(updates: Partial<MonitoringConfig>): Promise<void> {
    if (!this.configId || !this.currentConfig) {
      throw new Error('Configuration not initialized');
    }

    try {
      const updatedConfig = {
        metrics_config: {
          ...this.currentConfig.metrics,
          ...(updates.metrics || {})
        },
        alerts_config: {
          ...this.currentConfig.alerts,
          ...(updates.alerts || {})
        }
      };

      const { error } = await supabase
        .from('monitoring_config')
        .update(updatedConfig)
        .eq('id', this.configId);

      if (error) throw error;

      const previousConfig = { ...this.currentConfig };
      this.currentConfig = {
        metrics: updatedConfig.metrics_config,
        alerts: updatedConfig.alerts_config
      };

      const session = await supabase.auth.getSession();
      const userId = session?.data.session?.user.id;

      this.emit('configChanged', {
        previous: previousConfig,
        current: this.currentConfig,
        changedBy: userId
      } as ConfigChangeEvent);
    } catch (error) {
      ErrorLogger.error('Failed to update monitoring configuration', error as Error);
      throw error;
    }
  }

  async getConfig(): Promise<MonitoringConfig> {
    if (!this.currentConfig) {
      await this.loadConfig();
    }
    return this.currentConfig!;
  }

  onConfigChanged(callback: (event: ConfigChangeEvent) => void): () => void {
    this.on('configChanged', callback);
    return () => this.off('configChanged', callback);
  }

  getMetricsConfig() {
    return this.currentConfig?.metrics;
  }

  getAlertsConfig() {
    return this.currentConfig?.alerts;
  }
}

export const monitoringConfigService = MonitoringConfigService.getInstance(); 