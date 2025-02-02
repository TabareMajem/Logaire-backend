// src/components/monitoring/health/HealthDashboard.tsx -->

import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useMetrics } from '@/hooks/useMetrics';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
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
import { PerformanceCard } from './cards/PerformanceCard';
import { ResourceUsageCard } from './cards/ResourceUsageCard';
import { ActiveAlertsPanel } from './ActiveAlertsPanel';

export function HealthDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h');
  const { health, isLoading: healthLoading, error: healthError } = useSystemHealth();
  const { metrics, isLoading: metricsLoading, error: metricsError } = useMetrics({
    types: ['system_health', 'api_latency', 'resource_usage'],
    timeRange: selectedTimeRange
  });

  if (healthLoading || metricsLoading) {
    return <div>Loading system health data...</div>;
  }

  if (healthError || metricsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load system health data: {healthError?.message || metricsError?.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Health</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-md border p-2"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SystemStatusCard status={health.status} />
        <ResourceUsageCard metrics={metrics.resourceUsage} />
        <PerformanceCard metrics={metrics.performance} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">System Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <MetricsChart
                data={metrics.overview}
                metrics={['cpu', 'memory', 'diskSpace']}
                title="Resource Utilization"
              />
              <MetricsChart
                data={metrics.latency}
                metrics={['api', 'database', 'cache']}
                title="System Latency"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Component Status</h3>
            <div className="space-y-4">
              {Object.entries(health.components).map(([name, status]) => (
                <ComponentStatusCard
                  key={name}
                  name={name}
                  status={status}
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Detailed Metrics</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.detailed}>
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
                    dataKey="errorRate"
                    name="Error Rate"
                    stroke="#EF4444"
                  />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    name="Latency"
                    stroke="#3B82F6"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <ActiveAlertsPanel alerts={health.alerts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SystemStatusCardProps {
  status: 'healthy' | 'degraded' | 'critical';
}

function SystemStatusCard({ status }: SystemStatusCardProps) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-gray-500">System Status</h3>
      <div className="mt-2">
        <Badge className={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
    </Card>
  );
}

interface ComponentStatusCardProps {
  name: string;
  status: {
    status: 'operational' | 'degraded' | 'down';
    latency: number;
    errorRate: number;
  };
}

function ComponentStatusCard({ name, status }: ComponentStatusCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">
            Latency: {status.latency}ms | Error Rate: {(status.errorRate * 100).toFixed(1)}%
          </p>
        </div>
        <Badge
          variant={
            status.status === 'operational'
              ? 'destructive'
              : status.status === 'degraded'
              ? 'secondary'
              : 'default'
          }
        >
          {status.status}
        </Badge>
      </div>
    </Card>
  );
}

interface MetricsChartProps {
  data: any[];
  metrics: string[];
  title: string;
}

function MetricsChart({ data, metrics, title }: MetricsChartProps) {
  return (
    <div className="h-[300px]">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={`hsl(${index * 120}, 70%, 50%)`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 