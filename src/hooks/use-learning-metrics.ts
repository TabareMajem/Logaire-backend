"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface LearningMetrics {
  accuracy: number;
  accuracyChange: number;
  latency: number;
  latencyChange: number;
  successRate: number;
  successRateChange: number;
  resourceUsage: number;
  resourceUsageChange: number;
  trends: {
    dates: string[];
    metrics: {
      accuracy: number[];
      latency: number[];
      successRate: number[];
      resourceUsage: number[];
    };
  };
}

export function useLearningMetrics(agentType?: string) {
  

  return useQuery({
    queryKey: ['learning-metrics', agentType],
    queryFn: async (): Promise<LearningMetrics> => {
      try {
        // Fetch current metrics
        const { data: current, error: currentError } = await supabase
          .rpc('get_learning_metrics', { agent_type: agentType });

        if (currentError) throw currentError;

        // Fetch historical metrics for trends
        const { data: historical, error: historicalError } = await supabase
          .rpc('get_learning_metrics_history', { 
            agent_type: agentType,
            days_back: 30 
          });

        if (historicalError) throw historicalError;

        // Calculate changes from previous period
        const previousPeriod = historical[historical.length - 2] || current;
        
        return {
          accuracy: current.accuracy,
          accuracyChange: calculateChange(current.accuracy, previousPeriod.accuracy),
          latency: current.latency,
          latencyChange: calculateChange(current.latency, previousPeriod.latency),
          successRate: current.success_rate,
          successRateChange: calculateChange(current.success_rate, previousPeriod.success_rate),
          resourceUsage: current.resource_usage,
          resourceUsageChange: calculateChange(current.resource_usage, previousPeriod.resource_usage),
          trends: {
            dates: historical.map((h: { timestamp: any; }) => h.timestamp),
            metrics: {
              accuracy: historical.map((h: { accuracy: any; }) => h.accuracy),
              latency: historical.map((h: { latency: any; }) => h.latency),
              successRate: historical.map((h: { success_rate: any; }) => h.success_rate),
              resourceUsage: historical.map((h: { resource_usage: any; }) => h.resource_usage)
            }
          }
        };
      } catch (error) {
        ErrorLogger.error('Failed to fetch learning metrics', error as Error);
        throw error;
      }
    },
    refetchInterval: 60000 // Refresh every minute
  });
}

function calculateChange(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}