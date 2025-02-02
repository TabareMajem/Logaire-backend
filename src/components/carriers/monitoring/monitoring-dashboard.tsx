"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { RealtimeStatus } from './realtime-status';
import { StatusGrid } from './status-grid';
import { MetricsChart } from './metrics-chart';
import { PerformanceSummary } from './performance-summary';
import { CarrierAlertsPanel } from './alerts-panel';
import { useCarrierRealtime } from '@/hooks/use-carrier-realtime';
import { useQuery } from '@tanstack/react-query';
import { CarrierService } from '@/lib/carriers/core/carrier-service';

export function MonitoringDashboard() {
  // Initialize real-time updates
  useCarrierRealtime();

  // Fetch carrier health status
  const { data: healthStatus, isLoading: healthLoading } = useQuery({
    queryKey: ['carrier-health'],
    queryFn: async () => {
      const service = new CarrierService();
      return service.getCarrierHealth();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Carrier Monitoring</h2>
        <RealtimeStatus />
      </div>

      <PerformanceSummary />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Carrier Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusGrid statuses={healthStatus || {}} loading={healthLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsChart />
          </CardContent>
        </Card>
      </div>

      <CarrierAlertsPanel />
    </div>
  );
}