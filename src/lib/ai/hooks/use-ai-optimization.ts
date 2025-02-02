"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OptimizationOrchestrator } from '../integration/optimization-orchestrator';
import { ShipmentOptimization } from '../types/integration';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';
import { AIAgentContext } from '../types';

export function useAIOptimization(context: AIAgentContext) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const orchestrator = new OptimizationOrchestrator(context);

  const { mutate: optimizeShipment } = useMutation({
    mutationFn: async (shipmentId: string) => {
      setIsOptimizing(true);
      try {
        await orchestrator.optimizeAndMonitor(shipmentId);
      } finally {
        setIsOptimizing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shipments']});
      toast.success('Shipment optimization completed');
    },
    onError: (error) => {
      ErrorLogger.error('Shipment optimization failed', error as Error);
      toast.error('Failed to optimize shipment');
    }
  });

  return {
    optimizeShipment,
    isOptimizing
  };
}