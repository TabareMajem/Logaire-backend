// src/components/monitoring/config/LoggingConfig.tsx -->

import { ErrorBoundary } from '@/components/error-boundary';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { monitoringConfigService } from '@/services/monitoring-config-service';
import { MonitoringConfig } from '@/types/monitoring';
import { useEffect, useState } from 'react';
import { AlertsConfig } from './AlertsConfig';
import { MetricsConfig } from './MetricsConfig';
import { MonitoringConfig as Monitor } from '@/lib/monitoring/config/monitoring-config';

interface LoggingConfigProps {
  config: LoggingConfigType;  // Changed from the complex type to just LoggingConfigType
  onSave: (updates: LoggingConfigType) => Promise<void>;
}

export type LoggingConfigType = {
  alerts: { enableEmailNotifications: boolean; enableSlackNotifications: boolean; notificationEndpoints: string[]; thresholds: Record<string, { warning: number; critical: number; evaluationPeriod: number; }>; };
  metrics: { collectionInterval: number; retentionDays: number; enabledMetrics: string[]; aggregationRules: { function: "avg" | "sum" | "max" | "min"; metric: string; interval: string; }[]; };
  retentionDays: number;
  level: "debug" | "info" | "warn" | "error";
  enabledCategories: string[];
};

export function LoggingConfig({ config, onSave }: LoggingConfigProps) {
  const [currentConfig, setCurrentConfig] = useState<LoggingConfigType>(config);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const [ , setConfig ] = useState<MonitoringConfig | null>(null);

  useEffect(() => {
    loadConfig();
    const unsubscribe = monitoringConfigService.onConfigChanged((event) => {
      setConfig(event.current);
    });
    return unsubscribe;
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const config = await monitoringConfigService.getConfig();
      setConfig(config);
    } catch (error) {
      console.error('Failed to load monitoring config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetricsUpdate = async (updates: Monitor['metrics']) => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      metrics: {
        ...updates
      }
    };
    // await monitoringConfigService.updateConfig(updatedConfig);
  };

  const handleAlertsUpdate = async (updates: Monitor['alerts']) => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      alerts: updates
    };
    
    // Transform the config to match MonitoringConfig type
    const transformedConfig: Partial<MonitoringConfig> = {
      metrics: {
        ...updatedConfig.metrics,
        enableAggregation: true // or some default value/logic
      },
      alerts: updatedConfig.alerts,
      // logging: updatedConfig.logging
    };
    
    await monitoringConfigService.updateConfig(transformedConfig);
  };
  
  const handleLoggingUpdate = async (updates: Monitor['logging']) => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      logging: updates
    };
    
    // Transform the config to match MonitoringConfig type
    const transformedConfig: Partial<MonitoringConfig> = {
      metrics: {
        ...updatedConfig.metrics,
        enableAggregation: true // or some default value/logic
      },
      alerts: updatedConfig.alerts,
      // logging: updatedConfig.logging
    };
    
    await monitoringConfigService.updateConfig(transformedConfig);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!config) return null;

  return (
    <ErrorBoundary>
      <Card className="p-6">
        <Tabs defaultValue="metrics">
          <TabsList>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logging">Logging</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <MetricsConfig 
              config={{
                ...config.metrics,
                enabledMetrics: config.metrics.enabledMetrics || [],
                aggregationRules: config.metrics.aggregationRules || []
              }}
              onSave={handleMetricsUpdate}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsConfig 
              config={{
                ...config.alerts,
                notificationEndpoints: config.alerts.notificationEndpoints || [],
                thresholds: Object.fromEntries(
                  Object.entries(config.alerts.thresholds || {}).map(([key, value]) => [
                    key,
                    {
                      ...value,
                      evaluationPeriod: value.evaluationPeriod || 60, 
                    },
                  ])
                ),
              }}
              onSave={handleAlertsUpdate}
            />
          </TabsContent>

          <TabsContent value="logging">
            {/* <LoggingConfig 
              config={config.alerts as LoggingConfigType}
              onSave={handleLoggingUpdate}
            /> */}
          </TabsContent>
        </Tabs>
      </Card>
    </ErrorBoundary>
  );
}

export default LoggingConfig;

