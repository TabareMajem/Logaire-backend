import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

export const MonitoringConfigSchema = z.object({
  metrics: z.object({
    collectionInterval: z.number().min(1000).max(60000),
    retentionDays: z.number().min(1).max(365),
    enabledMetrics: z.array(z.string()),
    aggregationRules: z.array(z.object({
      metric: z.string(),
      interval: z.string(),
      function: z.enum(['avg', 'sum', 'max', 'min'])
    }))
  }),
  alerts: z.object({
    enableEmailNotifications: z.boolean(),
    enableSlackNotifications: z.boolean(),
    notificationEndpoints: z.array(z.string().url()),
    thresholds: z.record(z.object({
      warning: z.number(),
      critical: z.number(),
      evaluationPeriod: z.number()
    }))
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']),
    enabledCategories: z.array(z.string()),
    retentionDays: z.number()
  })
});

export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;

export class MonitoringConfigManager {
  private static instance: MonitoringConfigManager;
  private config: MonitoringConfig;
  private subscribers: Set<(config: MonitoringConfig) => void>;

  private constructor() {
    this.subscribers = new Set();
    this.config = this.getDefaultConfig();
  }

  static getInstance(): MonitoringConfigManager {
    if (!this.instance) {
      this.instance = new MonitoringConfigManager();
    }
    return this.instance;
  }

  async loadConfig(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('monitoring_config')
        .select('*')
        .single();

      if (error) throw error;

      this.config = MonitoringConfigSchema.parse(data.config);
      this.notifySubscribers();
    } catch (error) {
      ErrorLogger.error('Failed to load monitoring config', error as Error);
      // Fall back to default config
      this.config = this.getDefaultConfig();
    }
  }

  async updateConfig(newConfig: Partial<MonitoringConfig>): Promise<void> {
    try {
      const updatedConfig = {
        ...this.config,
        ...newConfig
      };

      // Validate the new config
      MonitoringConfigSchema.parse(updatedConfig);

      const { error } = await supabase
        .from('monitoring_config')
        .upsert({ config: updatedConfig });

      if (error) throw error;

      this.config = updatedConfig;
      this.notifySubscribers();
    } catch (error) {
      ErrorLogger.error('Failed to update monitoring config', error as Error);
      throw error;
    }
  }

  subscribe(callback: (config: MonitoringConfig) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.config));
  }

  private getDefaultConfig(): MonitoringConfig {
    return {
      metrics: {
        collectionInterval: 5000,
        retentionDays: 30,
        enabledMetrics: ['cpu', 'memory', 'requests', 'errors'],
        aggregationRules: [
          {
            metric: 'requests',
            interval: '1m',
            function: 'sum'
          }
        ]
      },
      alerts: {
        enableEmailNotifications: true,
        enableSlackNotifications: false,
        notificationEndpoints: [],
        thresholds: {
          cpu_usage: {
            warning: 70,
            critical: 90,
            evaluationPeriod: 300
          },
          error_rate: {
            warning: 5,
            critical: 10,
            evaluationPeriod: 60
          }
        }
      },
      logging: {
        level: 'info',
        enabledCategories: ['system', 'security', 'performance'],
        retentionDays: 90
      }
    };
  }
} 