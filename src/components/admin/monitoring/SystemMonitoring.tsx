// src/components/admin/monitoring/SystemMonitoring.tsx -->

import { MetricsCard } from '@/components/monitoring/metrics/MetricsCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useSystemMetrics } from '@/hooks/useSystemMetrics.ts';
import { AlertsList } from './AlertsList';
import { HealthChecks } from './HealthChecks';
import { LogViewer } from './LogViewer';

export function SystemMonitoring() {
  const { metrics, isLoading } = useSystemMetrics();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">System Monitoring</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="CPU Usage"
          type="cpu"
          value={metrics?.cpu?.current || 0}
          data={metrics?.cpu?.history}
          isLoading={isLoading}
          thresholds={{ warning: 70, critical: 90 }}
        />

        <MetricsCard
          title="Memory Usage"
          type="memory"
          value={metrics?.memory?.current || 0}
          data={metrics?.memory?.history}
          isLoading={isLoading}
          thresholds={{ warning: 80, critical: 95 }}
        />

        <MetricsCard
          title="Disk Usage"
          type="disk"
          value={metrics?.disk?.current || 0}
          data={metrics?.disk?.history}
          isLoading={isLoading}
          thresholds={{ warning: 85, critical: 95 }}
        />

        <MetricsCard
          title="Network Traffic"
          type="network"
          value={metrics?.network?.current || 0}
          data={metrics?.network?.history}
          isLoading={isLoading}
        />
      </div>

      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card className="p-6">
            <AlertsList />
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card className="p-6">
            <HealthChecks />
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="p-6">
            <LogViewer />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 