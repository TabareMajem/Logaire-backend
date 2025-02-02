"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { MetricsChart } from './metrics-chart';
import { AnomalyList } from './anomaly-list';
import { RecommendationsList } from './recommendations-list';
import { ErrorLogger } from '@/lib/errors/logger';

interface LearningMetrics {
  accuracy: number;
  accuracyChange: number;
  latency: number;
  latencyChange: number;
  successRate: number;
  successRateChange: number;
  resourceUsage: number;
  resourceUsageChange: number;
  trends: Array<{
    timestamp: string;
    accuracy: number;
    latency: number;
    successRate: number;
    resourceUsage: number;
  }>;
}

export function LearningMetricsDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<LearningMetrics>({
    queryKey: ['learning-metrics'],
    queryFn: async () => {
      try {
        // Fetch metrics implementation
        // Replace this with your actual API call
        return {
          accuracy: 0,
          accuracyChange: 0,
          latency: 0,
          latencyChange: 0,
          successRate: 0,
          successRateChange: 0,
          resourceUsage: 0,
          resourceUsageChange: 0,
          trends: []
        };
      } catch (error) {
        ErrorLogger.error('Failed to fetch learning metrics', error as Error);
        throw error;
      }
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const transformedData =
  metrics?.trends
    ? {
        dates: metrics.trends.map((trend) => trend.timestamp),
        metrics: {
          accuracy: metrics.trends.map((trend) => trend.accuracy),
          latency: metrics.trends.map((trend) => trend.latency),
          successRate: metrics.trends.map((trend) => trend.successRate),
          resourceUsage: metrics.trends.map((trend) => trend.resourceUsage),
        },
      }
    : undefined;

  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Learning System Metrics</h2>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Accuracy"
              value={metrics?.accuracy || 0}
              change={metrics?.accuracyChange || 0}
              loading={metricsLoading}
            />
            <MetricCard
              title="Response Time"
              value={metrics?.latency || 0}
              change={metrics?.latencyChange || 0}
              loading={metricsLoading}
              format="ms"
            />
            <MetricCard
              title="Success Rate"
              value={metrics?.successRate || 0}
              change={metrics?.successRateChange || 0}
              loading={metricsLoading}
              format="percentage"
            />
            <MetricCard
              title="Resource Usage"
              value={metrics?.resourceUsage || 0}
              change={metrics?.resourceUsageChange || 0}
              loading={metricsLoading}
              format="percentage"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsChart data={transformedData} loading={metricsLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle>Detected Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <AnomalyList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>System Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <RecommendationsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  loading?: boolean;
  format?: 'number' | 'percentage' | 'ms';
}

function MetricCard({ title, value, change, loading, format = 'number' }: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'ms':
        return `${val.toFixed(0)}ms`;
      default:
        return val.toFixed(2);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}