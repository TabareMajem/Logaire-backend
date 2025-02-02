import { Card } from '@/components/ui/card';
import { useAgents } from '@/hooks/useAgents';
import { useAlerts } from '@/hooks/useAlerts';
import { useMetrics } from '@/hooks/useMetrics';
import { AgentManagement } from '../agents/AgentManagement';
import { AlertsOverview } from './AlertsOverview';
import { MetricsOverview } from './MetricsOverview';
import { SystemStatus } from './SystemStatus';
import { UserManagement } from '../users/UserManagement';

export function AdminDashboard() {
  const { metrics, isLoading: metricsLoading } = useMetrics();
  const { agents, isLoading: agentsLoading } = useAgents();
  const { alerts, isLoading: alertsLoading } = useAlerts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="font-medium text-gray-500">Active Agents</h3>
          <p className="text-2xl font-bold mt-2">
            {agentsLoading ? '...' : agents.filter(a => a.status === 'active').length}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium text-gray-500">Active Alerts</h3>
          <p className="text-2xl font-bold mt-2">
            {alertsLoading ? '...' : alerts.filter(a => a.status === 'active').length}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium text-gray-500">Total Metrics</h3>
          <p className="text-2xl font-bold mt-2">
            {metricsLoading ? '...' : metrics.length}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium text-gray-500">System Health</h3>
          <SystemStatus />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentManagement />
        <AlertsOverview />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <MetricsOverview />
        <UserManagement />
      </div>
    </div>
  );
} 