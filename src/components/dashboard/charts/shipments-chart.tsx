"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeframeSelect } from './timeframe-select';
import { fetchShipmentStats, TimeFrame } from '@/lib/api/stats';
import { AreaChart, Card as TremorCard } from '@tremor/react';

const customTooltip = ({ payload, active }: any) => {
  if (!active || !payload) return null;

  return (
    <TremorCard className="w-56">
      <div className="flex flex-col space-y-1">
        <p className="text-sm text-muted-foreground">
          {format(new Date(payload[0].payload.date), 'MMM d, yyyy')}
        </p>
        {payload.map((category: any) => (
          <div key={category.dataKey} className="flex justify-between">
            <span className="capitalize text-sm">{category.dataKey}:</span>
            <span className="font-medium text-sm">{category.value}</span>
          </div>
        ))}
      </div>
    </TremorCard>
  );
};

export function ShipmentsChart() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('30d');
  
  const { data, isLoading } = useQuery({
    queryKey: ['shipment-stats', timeframe],
    queryFn: () => fetchShipmentStats(timeframe)
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shipment Overview</CardTitle>
          <TimeframeSelect
            value={timeframe}
            onChange={setTimeframe}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <AreaChart
            data={data || []}
            index="date"
            categories={['completed', 'active', 'delayed']}
            colors={['emerald', 'blue', 'red']}
            valueFormatter={(value) => value.toString()}
            showLegend
            showGridLines
            showYAxis
            showXAxis
            customTooltip={customTooltip}
          />
        </div>
      </CardContent>
    </Card>
  );
}