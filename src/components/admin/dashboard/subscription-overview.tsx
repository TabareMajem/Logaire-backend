"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@tremor/react';

export function SubscriptionOverview() {

  const { data } = useQuery({
    queryKey: ['subscription-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_subscription_trends');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const chartData = data?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString(),
    'Active Subscriptions': item.active_count,
    'Trial Users': item.trial_count,
    'Churned': item.churned_count
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <LineChart
            data={chartData}
            index="date"
            categories={['Active Subscriptions', 'Trial Users', 'Churned']}
            colors={['green', 'blue', 'red']}
            valueFormatter={(value) => value.toString()}
            yAxisWidth={40}
          />
        </div>
      </CardContent>
    </Card>
  );
}