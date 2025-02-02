"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@tremor/react';

export function VoiceMetrics() {
  

  const { data: metrics } = useQuery({
    queryKey: ['voice-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_voice_interaction_metrics', {
          lookback_minutes: 1440 // 24 hours
        });

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const chartData = metrics?.map((m: any) => ({
    date: new Date(m.timestamp).toLocaleTimeString(),
    'Success Rate': m.success_rate * 100,
    'Average Duration': m.average_duration,
    'Confidence Score': m.average_confidence * 100
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Interaction Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <LineChart
            data={chartData}
            index="date"
            categories={['Success Rate', 'Confidence Score']}
            colors={['green', 'blue']}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            yAxisWidth={40}
          />
        </div>
      </CardContent>
    </Card>
  );
}