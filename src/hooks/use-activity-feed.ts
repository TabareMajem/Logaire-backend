"use client";

import { useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { fetchActivityFeed, Activity } from '@/lib/api/activity';

export function useActivityFeed(limit = 20) {
  const queryClient = useQueryClient();
  

  useEffect(() => {
    const subscription = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          queryClient.setQueryData(['activity-feed'], (old: Activity[] = []) => {
            return [payload.new as Activity, ...old].slice(0, limit);
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, limit]);

  return useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => fetchActivityFeed(limit),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}