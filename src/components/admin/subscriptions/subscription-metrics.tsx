"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { CreditCard, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export function SubscriptionMetrics() {

  const { data: metrics } = useQuery({
    queryKey: ['subscription-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_subscription_metrics');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const cards = [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(metrics?.monthly_revenue || 0, 'USD'),
      change: metrics?.revenue_growth || 0,
      icon: TrendingUp
    },
    {
      title: 'Active Subscriptions',
      value: metrics?.active_subscriptions || 0,
      change: metrics?.subscription_growth || 0,
      icon: CreditCard
    },
    {
      title: 'Paid Users',
      value: metrics?.paid_users || 0,
      change: metrics?.user_growth || 0,
      icon: Users
    },
    {
      title: 'Churn Rate',
      value: `${(metrics?.churn_rate || 0).toFixed(1)}%`,
      change: metrics?.churn_change || 0,
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