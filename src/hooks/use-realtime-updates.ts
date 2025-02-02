"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setupRealtimeChannels } from '@/lib/realtime/channels';

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = setupRealtimeChannels(queryClient);
    return () => unsubscribe();
  }, [queryClient]);
}