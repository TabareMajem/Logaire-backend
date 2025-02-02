"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Metric } from '@/lib/api/metrics';

interface MetricCardProps {
  metric: Metric;
}

export function MetricCard({ metric }: MetricCardProps) {
  // Type assertion: Ensures that metric.icon is a key in the Icons object
  const Icon = Icons[metric.icon as unknown as keyof typeof Icons];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {metric.title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <div className="flex items-center space-x-2 mt-1">
          <span className={cn(
            "text-xs",
            metric.changeType === 'increase' && "text-green-600",
            metric.changeType === 'decrease' && "text-red-600",
            metric.changeType === 'neutral' && "text-muted-foreground"
          )}>
            {metric.changeType === 'increase' && <Icons.trendingUp className="h-3 w-3 inline mr-1" />}
            {metric.changeType === 'decrease' && <Icons.trendingDown className="h-3 w-3 inline mr-1" />}
            {metric.changeType === 'neutral' && <Icons.minus className="h-3 w-3 inline mr-1" />}
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </span>
          <span className="text-xs text-muted-foreground">vs. last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
