done done

"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MonitorService } from '../monitoring/monitor-service';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';

const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useAPIMonitoring() {
  const { toast } = useToast();
  const monitorService = new MonitorService();

  // Query for active alerts
  const { data: activeAlerts } = useQuery({
    queryKey: ['api-alerts'],
    queryFn: async () => {
      try {
        return await monitorService.alerts.getActiveAlerts();
      } catch (error) {
        ErrorLogger.error('Failed to fetch active alerts', error as Error);
        return [];
      }
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Set up monitoring interval
  useEffect(() => {
    const monitor = async () => {
      try {
        await monitorService.monitorServices();
      } catch (error) {
        ErrorLogger.error('API monitoring failed', error as Error);
        toast.error('API monitoring service encountered an error');
      }
    };

    const interval = setInterval(monitor, MONITORING_INTERVAL);
    monitor(); // Initial check

    return () => clearInterval(interval);
  }, [toast]);

  return {
    activeAlerts,
    isMonitoring: true
  };
}