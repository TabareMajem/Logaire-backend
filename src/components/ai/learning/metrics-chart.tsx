"use client";

import { LineChart } from '@tremor/react';
import { Card } from '@/components/ui/card';

interface MetricsChartProps {
  data?: {
    dates: string[];
    metrics: {
      accuracy: number[];
      latency: number[];
      successRate: number[];
      resourceUsage: number[];
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
    Accuracy: data.metrics.accuracy[i] * 100,
    'Success Rate': data.metrics.successRate[i] * 100,
    'Resource Usage': data.metrics.resourceUsage[i] * 100,
    Latency: data.metrics.latency[i]
  }));

  return (
    <LineChart
      data={chartData}
      index="date"
      categories={['Accuracy', 'Success Rate', 'Resource Usage', 'Latency']}
      colors={['blue', 'green', 'amber', 'rose']}
      valueFormatter={(value) => `${value.toFixed(1)}%`}
      yAxisWidth={40}
      showLegend
      showGridLines
      showAnimation
    />
  );
}