"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';

export function useCarrierRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  

  useEffect(() => {
    const channel = supabase.channel('carrier-updates')
      // Health status updates
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'carrier_health' },
        (payload) => {
          queryClient.invalidateQueries({queryKey: ['carrier-health']});
          if (payload.new.status !== 'healthy') {
            toast({
              title: 'Carrier Status Update',
              description: `${payload.new.carrier_id} is ${payload.new.status}`,
              variant: payload.new.status === 'down' ? 'destructive' : 'warning'
            } as any);
          }
        }
      )
      // Metrics updates
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'carrier_metrics' },
        () => {
          queryClient.invalidateQueries({queryKey: ['carrier-metrics']});
        }
      )
      // Alert updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'carrier_alerts' },
        (payload) => {
          queryClient.invalidateQueries({queryKey: ['carrier-alerts']});
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Alert',
              description: `${payload.new.carrier_id} is ${payload.new.status}`,
              variant: payload.new.status === 'down' ? 'destructive' : 'warning'
            } as any);
          }
        }
      );

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        ErrorLogger.error('Failed to subscribe to carrier updates', new Error(status));
      }
    });

    // Cleanup
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, toast]);

  return {
    isConnected: true
  };
}