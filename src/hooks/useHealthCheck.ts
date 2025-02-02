import { healthCheckManager, HealthCheckResult } from '@/lib/monitoring/health/health-check-manager';
import { useEffect, useState } from 'react';
import { useToast } from './useToast';

export function useHealthCheck(showNotifications = true) {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const handleHealthCheck = (results: HealthCheckResult[]) => {
      setHealthStatus(results);
      setIsLoading(false);

      if (showNotifications) {
        const unhealthyComponents = results.filter(r => r.status === 'unhealthy');
        if (unhealthyComponents.length > 0) {
          showToast({
            type: 'error',
            message: `Unhealthy components detected: ${unhealthyComponents.map(c => c.component).join(', ')}`
          });
        }
      }
    };

    const handleError = (error: Error) => {
      if (showNotifications) {
        showToast({
          type: 'error',
          message: `Health check failed: ${error.message}`
        });
      }
    };

    const unsubscribeComplete = healthCheckManager.onHealthCheckComplete(handleHealthCheck);
    const unsubscribeError = healthCheckManager.onHealthCheckError(handleError);

    // Start health checks
    healthCheckManager.startHealthChecks();

    return () => {
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [showNotifications, showToast]);

  return {
    healthStatus,
    isLoading,
    isHealthy: healthStatus.every(status => status.status === 'healthy'),
    hasDegradedServices: healthStatus.some(status => status.status === 'degraded'),
    hasUnhealthyServices: healthStatus.some(status => status.status === 'unhealthy')
  };
} 