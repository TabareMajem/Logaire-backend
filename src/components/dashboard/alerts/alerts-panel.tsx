"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchAlerts, markAlertAsRead, AlertType } from '@/lib/api/alerts';
import { AlertCard } from './alert-card';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'warning', label: 'Warnings' },
  { value: 'error', label: 'Errors' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
] as const;

export function AlertsPanel() {
  const [filter, setFilter] = useState<AlertType | 'all'>('all');
  const { toast } = useToast();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts
  });

  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    return filter === 'all' 
      ? alerts 
      : alerts.filter(alert => alert.type === filter);
  }, [alerts, filter]);

  const handleDismiss = async (id: string) => {
    try {
      await markAlertAsRead(id);
      toast.success('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <CardTitle>Alerts & Notifications</CardTitle>
          <div className="h-9 w-[300px] bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alerts & Notifications</CardTitle>
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as AlertType | 'all')}
        >
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4 pr-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={handleDismiss}
              />
            ))}
            {filteredAlerts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No alerts to display
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}