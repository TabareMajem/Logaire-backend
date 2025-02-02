"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  successRate: number;
}

interface PerformanceSummaryProps {
  metrics?: PerformanceMetrics;
  loading?: boolean;
}

export function PerformanceSummary({ metrics, loading }: PerformanceSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summaryItems = [
    {
      title: 'Total Requests',
      value: metrics?.requestCount || 0,
      icon: Activity,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Success Rate',
      value: `${((metrics?.successRate || 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Avg Latency',
      value: `${metrics?.averageLatency || 0}ms`,
      icon: AlertTriangle,
      change: '-8%',
      trend: 'down'
    },
    {
      title: 'Error Rate',
      value: `${((metrics?.errorCount || 0) / (metrics?.requestCount || 1) * 100).toFixed(1)}%`,
      icon: TrendingDown,
      change: '-3%',
      trend: 'down'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className={`text-xs ${
              item.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {item.change} from last period
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}