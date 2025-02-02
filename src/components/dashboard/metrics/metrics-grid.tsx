"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const metrics = [
  {
    title: 'Active Shipments',
    value: '24',
    icon: Ship,
    change: '+12%'
  },
  {
    title: 'On-Time Delivery',
    value: '98.5%',
    icon: Clock,
    change: '+2.1%'
  },
  {
    title: 'Cost Savings',
    value: '$45,280',
    icon: TrendingUp,
    change: '+15%'
  },
  {
    title: 'Completed Bookings',
    value: '156',
    icon: CheckCircle,
    change: '+8%'
  }
];

export function DashboardMetrics() {
  const { data: dashboardMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => metrics
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {dashboardMetrics?.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-green-600">
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}