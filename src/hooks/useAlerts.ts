// // src/hooks/useAlerts.ts -->

import { AlertManager } from '@/lib/monitoring/alerts/alert-manager';
import { Alert, AlertSeverity, AlertStatus } from '@/types/monitoring';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from './useToast';

interface UseAlertsOptions {
  status?: AlertStatus;
  severity?: AlertSeverity;
  autoRefresh?: boolean;
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();
  const alertManager = AlertManager.getInstance();

  useEffect(() => {
    loadAlerts();
    let unsubscribe: (() => void) | undefined;

    if (options.autoRefresh) {
      setupAlertSubscription().then(
        unsub => { unsubscribe = unsub; }
      );
    }

    return () => {
      unsubscribe?.();
    };
  }, [options.status, options.severity]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedAlerts = await alertManager.getAlerts({
        status: options.status,
        severity: options.severity
      });
      setAlerts(fetchedAlerts);
    } catch (err) {
      setError(err as Error);
      showToast({
        type: 'error',
        message: 'Failed to load alerts'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupAlertSubscription = async () => {
    try {
      return await alertManager.subscribeToAlerts((alert) => {
        setAlerts(prev => {
          const index = prev.findIndex(a => a.id === alert.id);
          if (index >= 0) {
            // Update existing alert
            const updated = [...prev];
            updated[index] = alert;
            return updated;
          } else {
            // Add new alert
            return [...prev, alert];
          }
        });
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to subscribe to alerts'
      });
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await alertManager.acknowledgeAlert(alertId);
      showToast({
        type: 'success',
        message: 'Alert acknowledged'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to acknowledge alert'
      });
      throw err;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await alertManager.resolveAlert(alertId);
      showToast({
        type: 'success',
        message: 'Alert resolved'
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to resolve alert'
      });
      throw err;
    }
  };

  // Add the subscribeToAlerts function that wraps the alertManager's subscription
  const subscribeToAlerts = useCallback((callback: (alert: Alert) => void) => {
    return alertManager.subscribeToAlerts(callback);
  }, [alertManager]);

  return {
    alerts,
    isLoading,
    error,
    acknowledgeAlert,
    resolveAlert,
    refresh: loadAlerts,
    subscribeToAlerts // Expose the subscribeToAlerts function
  };
}