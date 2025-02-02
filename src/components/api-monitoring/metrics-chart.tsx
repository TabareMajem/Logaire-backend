"use client";

import { LineChart } from '@tremor/react';
import { Card } from '@/components/ui/card';

interface MetricsChartProps {
  data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
}

export function MetricsChart({ data }: MetricsChartProps) {
  if (!data) {
    return (
      <Card className="h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground">No metrics data available</p>
      </Card>
    );
  }

  return (
    <LineChart
      data={data.labels.map((label, i) => ({
        date: label,
        ...data.datasets.reduce((acc, dataset) => ({
          ...acc,
          [dataset.label]: dataset.data[i]
        }), {})
      }))}
      index="date"
      categories={data.datasets.map(d => d.label)}
      colors={["blue", "green"]}
      valueFormatter={(value) => `${value}%`}
      yAxisWidth={40}
    />
  );
}