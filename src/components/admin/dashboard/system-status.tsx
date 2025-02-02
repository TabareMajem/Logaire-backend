"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

export function SystemStatus() {

  const { data: status } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  const metrics = [
    {
      name: 'API Response Time',
      value: status?.api_latency || 0,
      target: 500,
      unit: 'ms'
    },
    {
      name: 'Database Load',
      value: status?.db_load || 0,
      target: 80,
      unit: '%'
    },
    {
      name: 'Memory Usage',
      value: status?.memory_usage || 0,
      target: 85,
      unit: '%'
    },
    {
      name: 'Storage Usage',
      value: status?.storage_usage || 0,
      target: 90,
      unit: '%'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Status</CardTitle>
        <Badge variant={status?.health === 'healthy' ? 'default' : 'destructive'}>
          {status?.health || 'Unknown'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{metric.name}</span>
                <span className="text-muted-foreground">
                  {metric.value}{metric.unit} / {metric.target}{metric.unit}
                </span>
              </div>
              <Progress 
                value={(metric.value / metric.target) * 100}
                className={
                  metric.value > metric.target * 0.9 ? 'bg-red-500' :
                  metric.value > metric.target * 0.75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }
              />
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            Last updated {status?.recorded_at ? 
              formatDistanceToNow(new Date(status.recorded_at), { addSuffix: true }) : 
              'never'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}