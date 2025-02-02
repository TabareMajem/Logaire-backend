"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Plane, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const metrics = [
  {
    title: 'Active Shipments',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Plane
  },
  {
    title: 'On-Time Delivery',
    value: '98.5%',
    change: '+2.1%',
    trend: 'up',
    icon: Clock
  },
  {
    title: 'Cost Savings',
    value: '$45,280',
    change: '+15%',
    trend: 'up',
    icon: TrendingUp
  },
  {
    title: 'Completed Bookings',
    value: '156',
    change: '+8%',
    trend: 'up',
    icon: CheckCircle
  }
];

export function DemoMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{metric.value}</h3>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
}
