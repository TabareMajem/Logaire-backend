import { ErrorBoundary } from '@/components/error-boundary';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { AdvancedMetricsChart } from '../visualization/AdvancedMetricsChart';
import { MetricsAggregationChart } from '../visualization/MetricsAggregationChart';
import { AggregatedMetricCard } from './AggregatedMetricCard';

export function MetricsPanel() {
  return (
    <ErrorBoundary>
      <Card className="p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AggregatedMetricCard
                type="cpu"
                title="CPU Usage"
                window="5m"
                thresholds={{ warning: 70, critical: 90 }}
              />
              <AggregatedMetricCard
                type="memory"
                title="Memory Usage"
                window="5m"
                thresholds={{ warning: 80, critical: 95 }}
              />
              <AggregatedMetricCard
                type="disk"
                title="Disk Usage"
                window="5m"
                thresholds={{ warning: 85, critical: 95 }}
              />
              <AggregatedMetricCard
                type="network"
                title="Network Traffic"
                window="5m"
                thresholds={{ warning: 100, critical: 200 }}
              />
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-6">
              <MetricsAggregationChart
                metricType="cpu"
                title="CPU Usage Over Time"
                className="h-[400px]"
              />
              <MetricsAggregationChart
                metricType="memory"
                title="Memory Usage Over Time"
                className="h-[400px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedMetricsChart
              metrics={['cpu', 'memory', 'disk', 'network']}
              title="System Metrics Comparison"
              className="h-[600px]"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </ErrorBoundary>
  );
} 