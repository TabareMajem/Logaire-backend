// src/components/integrations/IntegrationStatusDashboard.tsx -->

import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { useIntegrations } from '@/hooks/useIntegrations';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Integration, IntegrationType } from '@/types/integrations';


interface IntegrationStatus {
  id: string;
  name: string;
  type: IntegrationType;  // Changed from limited union type to use IntegrationType
  status: 'operational' | 'degraded' | 'down';  // Keep this specific for the dashboard
  lastSync: string;
  uptime: number;
  errorRate: number;
  latency: number;
}

function mapToIntegrationStatus(integration: Integration): IntegrationStatus {
  return {
    id: integration.id,
    name: integration.name,
    type: integration.type,
    // Map the status values
    status: integration.status === 'active' ? 'operational' :
            integration.status === 'error' ? 'down' :
            'degraded',
    lastSync: integration.lastSync || integration.updated_at,
    uptime: integration.uptime,
    errorRate: integration.errorRate,
    latency: integration.latency
  };
}

export function IntegrationStatusDashboard() {
  const { integrations, metrics, isLoading, error, refresh: refreshStatus } = useIntegrations();
  const mappedIntegrations = integrations.map(mapToIntegrationStatus);

  if (isLoading) {
    return <div>Loading integration status...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Integration Status</h1>
        <Button variant="outline" size="sm" onClick={refreshStatus}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>

        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Integrations"
          value={integrations.length}
          trend={{
            value: 2,
            label: 'from last month'
          }}
        />
        <MetricCard
          title="Operational"
          value={integrations.filter(i => i.status === 'operational').length}
          variant="success"
        />
        <MetricCard
          title="Average Uptime"
          value={`${calculateAverageUptime(mappedIntegrations)}%`}
          variant="info"
        />

        <MetricCard
          title="Total Errors (24h)"
          value={metrics.totalErrors}
          variant="error"
        />
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Integration Performance</h2>
            <select className="rounded-md border p-2">
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  name="Success Rate"
                  stroke="#10B981"
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  name="Latency (ms)"
                  stroke="#3B82F6"
                />
                <Line
                  type="monotone"
                  dataKey="errorRate"
                  name="Error Rate"
                  stroke="#EF4444"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Integration Details</h2>
        <div className="space-y-4">
          {mappedIntegrations.map((integration) => (
            <IntegrationStatusCard
              key={integration.id}
              integration={integration}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  variant?: 'default' | 'success' | 'error' | 'info';
  trend?: {
    value: number;
    label: string;
  };
}

function MetricCard({ title, value, variant = 'default', trend }: MetricCardProps) {
  const variants = {
    default: 'bg-white',
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50'
  };

  return (
    <Card className={`p-6 ${variants[variant]}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{value}</p>
        {trend && (
          <p className="ml-2 text-sm text-gray-500">
            {trend.value > 0 ? '+' : ''}{trend.value} {trend.label}
          </p>
        )}
      </div>
    </Card>
  );
}

function IntegrationStatusCard({ integration }: { integration: IntegrationStatus }) {
  const statusColors = {
    operational: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">{integration.name}</h3>
            <Badge className={statusColors[integration.status]}>
              {integration.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Last synced: {new Date(integration.lastSync).toLocaleString()}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Uptime</p>
          <p className="text-sm font-medium">{integration.uptime}%</p>
          <Progress value={integration.uptime} className="mt-1" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Error Rate</p>
          <p className="text-sm font-medium">{integration.errorRate}%</p>
          <Progress value={integration.errorRate} className="mt-1" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Latency</p>
          <p className="text-sm font-medium">{integration.latency}ms</p>
          <Progress value={integration.latency / 10} className="mt-1" />
        </div>
      </div>
    </Card>
  );
}

function calculateAverageUptime(integrations: IntegrationStatus[]): number {
  if (integrations.length === 0) return 0;
  const total = integrations.reduce((sum, i) => sum + i.uptime, 0);
  return Math.round(total / integrations.length);
} 