"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface CarrierAlert {
  id: string;
  carrier_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  details?: Record<string, any>;
  resolved: boolean;
  created_at: string;
}

export function CarrierAlertsPanel() {
  

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['carrier-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carrier_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CarrierAlert[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const resolveAlert = async (alertId: string) => {
    await supabase
      .from('carrier_alerts')
      .update({ resolved: true })
      .eq('id', alertId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Active Alerts
        </CardTitle>
        <Badge variant="secondary">
          {alerts?.length || 0} Active
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {alerts?.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No active alerts
              </div>
            ) : (
              alerts?.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between space-x-4 rounded-lg border p-4"
                >
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className={
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    } />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{alert.carrier_id}</p>
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Resolve
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}