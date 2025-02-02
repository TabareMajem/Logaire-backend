"use client";

import { useQuery } from '@tanstack/react-query';
import { MockAPIService } from '@/lib/mock/api-service';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export function DemoMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ['demo-metrics'],
    queryFn: MockAPIService.getMetrics
  });

  if (!metrics) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Shipments"
        value={metrics.activeShipments}
        change="+12%"
        icon={Plane}
      />
      <MetricCard
        title="On-Time Delivery"
        value={`${metrics.onTimeDelivery}%`}
        change="+2.1%"
        icon={Clock}
      />
      <MetricCard
        title="Cost Savings"
        value={`$${metrics.costSavings.toLocaleString()}`}
        change="+15%"
        icon={TrendingUp}
      />
      <MetricCard
        title="Completed Bookings"
        value={metrics.completedBookings}
        change="+8%"
        icon={CheckCircle}
      />
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-green-600">{change}</span>
        </div>
        <h3 className="mt-4 text-2xl font-bold">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}