"use client";

import { LineChart } from '@tremor/react';
import { Card } from '@/components/ui/card';

interface MetricsChartProps {
  data?: {
    dates: string[];
    metrics: {
      successRate: number[];
      errorRate: number[];
      latency: number[];
    };
  };
  loading?: boolean;
}

export function MetricsChart({ data, loading }: MetricsChartProps) {
  if (loading) {
    return (
      <div className="h-[350px] w-full animate-pulse rounded-lg bg-muted" />
    );
  }

  if (!data) {
    return (
      <Card className="flex h-[350px] items-center justify-center">
        <p className="text-muted-foreground">No metrics data available</p>
      </Card>
    );
  }

  const chartData = data.dates.map((date, i) => ({
    date,
    'Success Rate': data.metrics.successRate[i] * 100,
    'Error Rate': data.metrics.errorRate[i] * 100,
    'Avg Latency (ms)': data.metrics.latency[i]
  }));

  return (
    <LineChart
      data={chartData}
      index="date"
      categories={['Success Rate', 'Error Rate', 'Avg Latency (ms)']}
      colors={['green', 'red', 'blue']}
      valueFormatter={(value) => `${value.toFixed(1)}`}
      yAxisWidth={40}
      showLegend
      showGridLines
      showAnimation
    />
  );
}