"use client";

import { useVoiceMetrics } from '@/hooks/use-voice-metrics';
import { LineChart } from '@tremor/react';

export function VoiceMetricsChart() {
  const { data: metrics } = useVoiceMetrics();
  
  const chartData = metrics
    ? [
        {
          hour: 'Total',
          'Success Rate': (metrics.successRate * 100).toFixed(1),
          'Confidence': (metrics.averageConfidence * 100).toFixed(1),
        }
      ]
    : [];

  return (
    <LineChart
      data={chartData}
      index="hour"
      categories={['Success Rate', 'Confidence']}
      colors={['emerald', 'blue']}
      valueFormatter={(value) => `${value}%`}
      yAxisWidth={40}
      showAnimation
    />
  );
}
