// src/components/monitoring/config/MonitoringConfigPanel/tsx -->

import { ErrorBoundary } from '@/components/error-boundary';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { monitoringConfigService } from '@/services/monitoring-config-service';
import { MonitoringConfig } from '@/types/monitoring';
import { useEffect, useState } from 'react';
import { AlertsConfig } from './AlertsConfig';
import { LoggingConfig, LoggingConfigType } from './LoggingConfig';
import { MetricsConfig } from './MetricsConfig';
import { MonitoringConfig as Monitor } from '@/lib/monitoring/config/monitoring-config';

export function MonitoringConfigPanel() {
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <MetricsConfig config={config.metrics} onSave={function (updates: Monitor['metrics']): void {
              throw new Error('Function not implemented.');
            } } />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsConfig config={config.alerts} onSave={function (updates: Monitor['alerts']): void {
              throw new Error('Function not implemented.');
            } } />
          </TabsContent>

          <TabsContent value="logging">
            <LoggingConfig 
              config={config.alerts as unknown as LoggingConfigType}
              
              onSave={handleLoggingUpdate} 
            />
          </TabsContent>
        </Tabs>
      </Card>
    </ErrorBoundary>
  );
} 