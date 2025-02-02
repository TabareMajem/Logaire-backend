"use client";

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MonitorService } from '@/lib/carriers/monitoring/monitor-service';
import { CarrierHub } from '@/lib/carriers/core/carrier-hub';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';

const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCarrierMonitoring() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const hub = new CarrierHub();
  const monitorService = new MonitorService(hub);

  // Query for active alerts
  const { data: activeAlerts } = useQuery({
    queryKey: ['carrier-alerts'],
    queryFn: async () => {
      try {
        const alertManager = monitorService.alertManager;
        return await alertManager.getActiveAlerts();
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
        await monitorService.monitorCarriers();
        await monitorService.checkLatencyThresholds();
        await monitorService.checkErrorRates();
      } catch (error) {
        ErrorLogger.error('Carrier monitoring failed', error as Error);
        toast.error('Carrier monitoring service encountered an error');
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