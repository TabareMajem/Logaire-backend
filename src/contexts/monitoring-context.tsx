import { useToast } from '@/hooks/useToast';
import { monitoringService } from '@/services/monitoring-service';
import { MonitoringConfig } from '@/types/monitoring';
import { createContext, useContext, useState } from 'react';

interface MonitoringContextType {
  config: MonitoringConfig | null;
  isMonitoring: boolean;
  startMonitoring: (interval: number) => Promise<void>;
  stopMonitoring: () => Promise<void>;
  updateConfig: (config: Partial<MonitoringConfig>) => Promise<void>;
  error: Error | null;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const startMonitoring = async (interval: number) => {
    try {
      await monitoringService.startMonitoring(interval);
      setIsMonitoring(true);
      setError(null);
    } catch (err) {
      setError(err as Error);
      showToast({
        type: 'error',
        message: 'Failed to start monitoring'
      });
      throw err;
    }
  };

  const stopMonitoring = async () => {
    try {
      await monitoringService.stopMonitoring();
      setIsMonitoring(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
      showToast({
        type: 'error',
        message: 'Failed to stop monitoring'
      });
      throw err;
    }
  };

  const updateConfig = async (newConfig: Partial<MonitoringConfig>) => {
    try {
      await monitoringService.updateMonitoringConfig(newConfig);
      setConfig(prev => ({ ...prev!, ...newConfig }));
      setError(null);
    } catch (err) {
      setError(err as Error);
      showToast({
        type: 'error',
        message: 'Failed to update monitoring configuration'
      });
      throw err;
    }
  };

  return (
    <MonitoringContext.Provider
      value={{
        config,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        updateConfig,
        error
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
} 