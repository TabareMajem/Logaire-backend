"use client";

import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  useRealtimeUpdates();
  return children;
}