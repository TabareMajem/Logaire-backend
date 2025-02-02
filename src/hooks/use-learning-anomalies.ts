"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface Anomaly {
  id: string;
  metric: string;
  severity: 'low' | 'medium' | 'high';
  value: number;
  expected: number;
  deviation: number;
  timestamp: Date;
}

export function useLearningAnomalies(agentType?: string) {
  

  return useQuery({
    queryKey: ['learning-anomalies', agentType],
    queryFn: async (): Promise<Anomaly[]> => {
      try {
        const { data, error } = await supabase
          .from('learning_anomalies')
          .select('*')
          .eq('agent_type', agentType)
          .eq('resolved', false)
          .order('severity', { ascending: false })
          .order('timestamp', { ascending: false });

        if (error) throw error;
        return data.map(anomaly => ({
          ...anomaly,
          timestamp: new Date(anomaly.timestamp)
        }));
      } catch (error) {
        ErrorLogger.error('Failed to fetch learning anomalies', error as Error);
        throw error;
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}