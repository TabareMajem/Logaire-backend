// src/components/monitoring/config/MonitoringConfig.tsx

import { useToast } from '@/hooks/useToast';
import { MonitoringConfig } from '@/lib/monitoring/config/monitoring-config';
import { useEffect, useState } from 'react';
import { AlertsConfig } from './AlertsConfig';
import { LoggingConfig, LoggingConfigType } from './LoggingConfig';
import { MetricsConfig } from './MetricsConfig';


export function MonitoringConfigPanel() {
  const [activeTab, setActiveTab] = useState('metrics');
  const [config, setConfig] = useState<MonitoringConfig>();
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/monitoring/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to load monitoring configuration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (section: string, updates: Partial<MonitoringConfig>) => {
    try {
      const response = await fetch('/api/monitoring/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, updates })
      });

      if (!response.ok) throw new Error('Failed to update config');

      showToast({
        type: 'success',
        message: 'Configuration updated successfully'
      });

      await loadConfig();
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to update configuration'
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!config) return <div>Error loading configuration</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Alerts
          </button>
          <button
            onClick={() => setActiveTab('logging')}
            className={`${
              activeTab === 'logging'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Logging
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'metrics' && (
          <MetricsConfig
            config={config.metrics}
            onSave={(updates) => handleSave('metrics', { metrics: updates })}
          />
        )}
        {activeTab === 'alerts' && (
          <AlertsConfig
            config={config.alerts}
            onSave={(updates) => handleSave('alerts', { alerts: updates })}
          />
        )}
        {activeTab === 'logging' && (
          // <LoggingConfig
          //   config={config.logging}
          //   onSave={(updates: any) => handleSave('logging', { logging: updates })}
          // />
          <LoggingConfig 
              config={config.logging as unknown as LoggingConfigType}
              onSave={(updates: any) => handleSave('logging', { logging: updates })}
            />
        )}
      </div>
    </div>
  );
} 
