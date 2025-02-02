"use client";

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MonitoringService } from '../integration/monitoring-service';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';
import { AIAgentContext } from '../types';

const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useAIMonitoring(context: AIAgentContext) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const monitoringService = new MonitoringService(context);

  useEffect(() => {
    const monitor = async () => {
      try {
        await monitoringService.monitorActiveShipments();
      } catch (error) {
        ErrorLogger.error('Shipment monitoring failed', error as Error);
      }
    };

    const interval = setInterval(monitor, MONITORING_INTERVAL);
    monitor(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return {
    isMonitoring: true
  };
}