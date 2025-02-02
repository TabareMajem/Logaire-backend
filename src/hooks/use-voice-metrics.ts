"use client";

import { useQuery } from '@tanstack/react-query';
import { VoiceMetricsCollector } from '@/lib/voice/services/voice-metrics';

export function useVoiceMetrics(timeframe: number = 24 * 60) {
  const metricsCollector = new VoiceMetricsCollector();

  return useQuery({
    queryKey: ['voice-metrics', timeframe],
    queryFn: () => metricsCollector.getMetrics(timeframe),
    refetchInterval: 60000 // Refresh every minute
  });
}