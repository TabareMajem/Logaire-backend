import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useMonitoring } from '@/contexts/monitoring-context';
import { AlertNotifications } from '../alerts/AlertNotifications';
import { AlertsPanel } from '../alerts/AlertsPanel';
import { MonitoringErrorBoundary } from '../common/MonitoringErrorBoundary';
import { HealthDashboard } from '../health/HealthDashboard';
import { ConnectionStatus } from '../status/ConnectionStatus';
import { MetricsOverview } from './MetricsOverview';

export function MonitoringDashboard() {
  const { isMonitoring, startMonitoring, stopMonitoring, error } = useMonitoring();

  return (
    <MonitoringErrorBoundary>
      <AlertNotifications />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">System Monitoring</h1>
            <ConnectionStatus />
          </div>
          <Button
            onClick={() => isMonitoring ? stopMonitoring() : startMonitoring(30000)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-600">{error.message}</p>
          </div>
        )}

        <Tabs defaultValue="metrics">
          <TabsList>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="health">Health Status</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <MetricsOverview />
          </TabsContent>

          <TabsContent value="health">
            <HealthDashboard />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </MonitoringErrorBoundary>
  );
} 