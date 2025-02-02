"use client";

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PortOperationsSystem } from '@/lib/integrations/ports/port-system';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';

const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function usePortMonitoring() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const portSystem = new PortOperationsSystem();

  // Query for port statuses
  const { data: portStatuses, isLoading } = useQuery({
    queryKey: ['port-statuses'],
    queryFn: async () => {
      try {
        const ports = ['PORT123', 'PORT456']; // Replace with actual port IDs
        const statuses = await Promise.all(
          ports.map(portId => portSystem.getPortStatus(portId))
        );
        return ports.reduce((acc, portId, i) => ({
          ...acc,
          [portId]: statuses[i]
        }), {});
      } catch (error) {
        ErrorLogger.error('Failed to fetch port statuses', error as Error);
        return {};
      }
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Query for congestion data
  const { data: congestionData } = useQuery({
    queryKey: ['congestion-data'],
    queryFn: async () => {
      try {
        // Implementation for fetching congestion data
        return {
          portId: 'PORT123',
          updates: []
        };
      } catch (error) {
        ErrorLogger.error('Failed to fetch congestion data', error as Error);
        return null;
      }
    }
  });

  // Set up monitoring interval
  useEffect(() => {
    const monitor = async () => {
      try {
        // Monitor port operations
        const ports = ['PORT123', 'PORT456']; // Replace with actual port IDs
        for (const portId of ports) {
          // Subscribe to real-time updates
          const congestionSubscription = portSystem.monitorCongestion(portId)
            .subscribe({
              next: (update: any) => {
                queryClient.setQueryData(
                  ['congestion-data', portId],
                  (old: any) => ({
                    ...old,
                    updates: [...(old?.updates || []), update]
                  })
                );
              },
              error: (error: Error | undefined) => {
                ErrorLogger.error('Congestion monitoring error', error);
                toast.error('Error monitoring port congestion');
              }
            });

          const vesselSubscription = portSystem.monitorVesselMovements(portId)
            .subscribe({
              next: (movement: any) => {
                queryClient.setQueryData(
                  ['vessel-movements', portId],
                  (old: any) => [...(old || []), movement]
                );
              },
              error: (error: Error | undefined) => {
                ErrorLogger.error('Vessel monitoring error', error);
                toast.error('Error monitoring vessel movements');
              }
            });

          // Cleanup subscriptions
          return () => {
            congestionSubscription.unsubscribe();
            vesselSubscription.unsubscribe();
          };
        }
      } catch (error) {
        ErrorLogger.error('Port monitoring failed', error as Error);
        toast.error('Port monitoring service encountered an error');
      }
    };

    const interval = setInterval(monitor, MONITORING_INTERVAL);
    monitor(); // Initial check

    return () => clearInterval(interval);
  }, [queryClient, toast]);

  return {
    portStatuses,
    congestionData,
    isLoading,
    isMonitoring: true
  };
}