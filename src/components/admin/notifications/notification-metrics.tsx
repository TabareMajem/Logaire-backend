"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function NotificationMetrics() {

  const { data: metrics } = useQuery({
    queryKey: ['notification-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_notification_metrics');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const cards = [
    {
      title: 'Total Notifications',
      value: metrics?.total_count || 0,
      change: metrics?.total_growth || 0,
      icon: Bell
    },
    {
      title: 'Critical Alerts',
      value: metrics?.critical_count || 0,
      change: metrics?.critical_growth || 0,
      icon: AlertTriangle
    },
    {
      title: 'Read Rate',
      value: `${((metrics?.read_rate || 0) * 100).toFixed(1)}%`,
      change: metrics?.read_change || 0,
      icon: CheckCircle
    },
    {
      title: 'Avg Response Time',
      value: `${metrics?.avg_response_time || 0}m`,
      change: metrics?.response_change || 0,
      icon: Clock
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