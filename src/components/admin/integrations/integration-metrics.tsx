// src/components/admin/integrations/integration-metrics.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export function IntegrationMetrics() {

  const { data: metrics } = useQuery({
    queryKey: ['integration-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_integration_metrics');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const cards = [
    {
      title: 'Active Integrations',
      value: metrics?.active_count || 0,
      change: metrics?.active_growth || 0,
      icon: Activity
    },
    {
      title: 'Success Rate',
      value: `${((metrics?.success_rate || 0) * 100).toFixed(1)}%`,
      change: metrics?.success_change || 0,
      icon: CheckCircle
    },
    {
      title: 'Average Latency',
      value: `${metrics?.avg_latency || 0}ms`,
      change: metrics?.latency_change || 0,
      icon: Clock
    },
    {
      title: 'Error Rate',
      value: `${((metrics?.error_rate || 0) * 100).toFixed(1)}%`,
      change: metrics?.error_change || 0,
      icon: AlertTriangle
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className={`text-xs ${
                card.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change >= 0 ? '+' : ''}{card.change}% from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}