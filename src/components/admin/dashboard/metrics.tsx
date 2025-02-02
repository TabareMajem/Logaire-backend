"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Building2, Activity } from 'lucide-react';

export function AdminMetrics() {

  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_admin_metrics');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const cards = [
    {
      title: 'Total Users',
      value: metrics?.total_users || 0,
      change: metrics?.user_growth || 0,
      icon: Users
    },
    {
      title: 'Active Subscriptions',
      value: metrics?.active_subscriptions || 0,
      change: metrics?.subscription_growth || 0,
      icon: CreditCard
    },
    {
      title: 'Companies',
      value: metrics?.total_companies || 0,
      change: metrics?.company_growth || 0,
      icon: Building2
    },
    {
      title: 'System Health',
      value: `${metrics?.system_health || 100}%`,
      change: 0,
      icon: Activity
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
              <p className="text-xs text-muted-foreground">
                {card.change >= 0 ? '+' : ''}{card.change}% from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}