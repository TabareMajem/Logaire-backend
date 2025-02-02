"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'performance' | 'accuracy' | 'resource' | 'quality';
  implemented: boolean;
}

export function useLearningRecommendations(agentType?: string) {
  

  return useQuery({
    queryKey: ['learning-recommendations', agentType],
    queryFn: async (): Promise<Recommendation[]> => {
      try {
        const { data, error } = await supabase
          .from('learning_recommendations')
          .select('*')
          .eq('agent_type', agentType)
          .order('impact', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (error) {
        ErrorLogger.error('Failed to fetch learning recommendations', error as Error);
        throw error;
      }
    },
    refetchInterval: 60000 // Refresh every minute
  });
}