"use client";

import { LineChart } from '@tremor/react';
import { Card } from '@/components/ui/card';
import { CongestionUpdate } from '@/lib/integrations/ports/types';

interface CongestionChartProps {
  data?: {
    portId: string;
    updates: CongestionUpdate[];
  };
  loading?: boolean;
}

export function CongestionChart({ data, loading }: CongestionChartProps) {
  if (loading) {
    return (
      <div className="h-[350px] w-full animate-pulse rounded-lg bg-muted" />
    );
  }

  if (!data?.updates.length) {
    return (
      <Card className="flex h-[350px] items-center justify-center">
        <p className="text-muted-foreground">No congestion data available</p>
      </Card>
    );
  }

  const chartData = data.updates.map(update => ({
    date: update.timestamp.toLocaleString(),
    'Congestion Level': update.level * 100,
    'Gate Queue': update.details?.gateQueue || 0,
    'Yard Density': update.details?.yardDensity || 0
  }));

  return (
    <LineChart
      data={chartData}
      index="date"
      categories={['Congestion Level', 'Gate Queue', 'Yard Density']}
      colors={['blue', 'amber', 'green']}
      valueFormatter={(value) => `${value.toFixed(1)}%`}
      yAxisWidth={40}
      showLegend
      showGridLines
      showAnimation
    />
  );
}