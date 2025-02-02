done done

import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { AlertCircle, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const METRIC_TYPES = [
  'system_health',
  'api_latency',
  'resource_usage',
  'workflow_execution',
  'document_processing'
] as const;

const TIME_RANGES = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000
};

export function RealTimeMetricsDashboard() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<keyof typeof TIME_RANGES>('5m');
  
  const { metrics, isConnected, error } = useRealtimeMetrics({
    types: METRIC_TYPES,
    paused: isPaused
  });

  const filteredMetrics = useMemo(() => {
    const cutoff = Date.now() - TIME_RANGES[selectedTimeRange];
    return Object.fromEntries(
      Object.entries(metrics).map(([key, values]) => [
        key,
        values.filter(m => new Date(m.timestamp).getTime() > cutoff)
      ])
    );
  }, [metrics, selectedTimeRange]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Real-time Metrics</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as keyof typeof TIME_RANGES)}
            className="rounded-md border p-2"
          >
            <option value="1m">Last Minute</option>
            <option value="5m">Last 5 Minutes</option>
            <option value="15m">Last 15 Minutes</option>
            <option value="1h">Last Hour</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePause}
          >
            {isPaused ? (
              <PlayCircle className="h-4 w-4 mr-2" />
            ) : (
              <PauseCircle className="h-4 w-4 mr-2" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="System Health"
          value={getLatestMetricValue(filteredMetrics.system_health, 'health')}
          trend={calculateTrend(filteredMetrics.system_health, 'health')}
          status={isConnected ? 'connected' : 'disconnected'}
        />
        <MetricCard
          title="API Latency"
          value={`${getLatestMetricValue(filteredMetrics.api_latency, 'latency')}ms`}
          trend={calculateTrend(filteredMetrics.api_latency, 'latency')}
          status={isConnected ? 'connected' : 'disconnected'}
        />
        <MetricCard
          title="Resource Usage"
          value={`${getLatestMetricValue(filteredMetrics.resource_usage, 'cpu')}%`}
          trend={calculateTrend(filteredMetrics.resource_usage, 'cpu')}
          status={isConnected ? 'connected' : 'disconnected'}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMetrics.system_health}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="health"
                    name="System Health"
                    stroke="#10B981"
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    name="Errors"
                    stroke="#EF4444"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredMetrics.system_health}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    name="Memory Usage"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    name="CPU Usage"
                    stackId="2"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* Additional tabs content... */}
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  status: 'connected' | 'disconnected';
}

function MetricCard({ title, value, trend, status }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className={`h-2 w-2 rounded-full ${
            status === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {trend && (
            <p className={`mt-2 text-sm ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.value}%
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function getLatestMetricValue(metrics: any[] = [], key: string): number {
  return metrics[metrics.length - 1]?.[key] || 0;
}

function calculateTrend(metrics: any[] = [], key: string) {
  if (metrics.length < 2) return undefined;
  
  const current = metrics[metrics.length - 1][key];
  const previous = metrics[metrics.length - 2][key];
  
  const change = ((current - previous) / previous) * 100;
  
  return {
    value: Math.abs(Math.round(change)),
    direction: change >= 0 ? 'up' : 'down'
  };
} 