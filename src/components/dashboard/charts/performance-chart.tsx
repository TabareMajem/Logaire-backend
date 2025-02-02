"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeframeSelect } from './timeframe-select';
import { fetchPerformanceMetrics, TimeFrame } from '@/lib/api/stats';
import { LineChart, Card as TremorCard } from '@tremor/react';

const customTooltip = ({ payload, active }: any) => {
  if (!active || !payload) return null;

  return (
    <TremorCard className="w-56">
      <div className="flex flex-col space-y-1">
        <p className="text-sm text-muted-foreground">
          {format(new Date(payload[0].payload.date), 'MMM d, yyyy')}
        </p>
        {payload.map((metric: any) => (
          <div key={metric.dataKey} className="flex justify-between">
            <span className="capitalize text-sm">
              {metric.dataKey.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="font-medium text-sm">{metric.value}%</span>
          </div>
        ))}
      </div>
    </TremorCard>
  );
};

export function PerformanceChart() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('30d');
  
  const { data, isLoading } = useQuery({
    queryKey: ['performance-metrics', timeframe],
    queryFn: () => fetchPerformanceMetrics(timeframe)
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Metrics</CardTitle>
          <TimeframeSelect
            value={timeframe}
            onChange={setTimeframe}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <LineChart
            data={data || []}
            index="date"
            categories={['onTimeDelivery', 'documentAccuracy', 'customerSatisfaction']}
            colors={['blue', 'emerald', 'amber']}
            valueFormatter={(value) => `${value}%`}
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