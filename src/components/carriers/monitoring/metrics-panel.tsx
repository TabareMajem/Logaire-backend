"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { LineChart } from '@tremor/react';
import { supabase } from '@/lib/supabase/client';

interface CarrierMetrics {
  carrier_id: string;
  success_rate: number;
  error_rate: number;
  average_latency: number;
  request_count: number;
  timestamp: string;
}

export function CarrierMetricsPanel() {
  

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['carrier-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carrier_metrics')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as CarrierMetrics[];
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics?.reduce((acc, metric) => {
    const date = new Date(metric.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        date,
        'Success Rate': 0,
        'Error Rate': 0,
        'Avg Latency': 0,
        count: 0
      };
    }
    acc[date]['Success Rate'] += metric.success_rate;
    acc[date]['Error Rate'] += metric.error_rate;
    acc[date]['Avg Latency'] += metric.average_latency;
    acc[date].count++;
    return acc;
  }, {} as Record<string, any>);

  const normalizedData = Object.values(chartData || {}).map(day => ({
    ...day,
    'Success Rate': (day['Success Rate'] / day.count * 100).toFixed(1),
    'Error Rate': (day['Error Rate'] / day.count * 100).toFixed(1),
    'Avg Latency': Math.round(day['Avg Latency'] / day.count)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="success">
          <TabsList>
            <TabsTrigger value="success">Success Rate</TabsTrigger>
            <TabsTrigger value="error">Error Rate</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
          </TabsList>

          <TabsContent value="success">
            <LineChart
              data={normalizedData}
              index="date"
              categories={['Success Rate']}
              colors={['green']}
              valueFormatter={(value) => `${value}%`}
              showLegend={false}
              showGridLines
              showAnimation
            />
          </TabsContent>

          <TabsContent value="error">
            <LineChart
              data={normalizedData}
              index="date"
              categories={['Error Rate']}
              colors={['red']}
              valueFormatter={(value) => `${value}%`}
              showLegend={false}
              showGridLines
              showAnimation
            />
          </TabsContent>

          <TabsContent value="latency">
            <LineChart
              data={normalizedData}
              index="date"
              categories={['Avg Latency']}
              colors={['blue']}
              valueFormatter={(value) => `${value}ms`}
              showLegend={false}
              showGridLines
              showAnimation
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}