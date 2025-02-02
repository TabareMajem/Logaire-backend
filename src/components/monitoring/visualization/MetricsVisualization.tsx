done done

import { ErrorBoundary } from '@/components/error-boundary';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { usePreferenceSync } from '@/hooks/usePreferenceSync';
import { MetricType } from '@/types/monitoring';
import { AdvancedMetricsChart } from './AdvancedMetricsChart';
import { HistoricalDataChart } from './HistoricalDataChart';
import { MetricsAggregationChart } from './MetricsAggregationChart';

interface MetricsVisualizationProps {
  metricTypes: MetricType[];
  className?: string;
}

export function MetricsVisualization({ metricTypes, className }: MetricsVisualizationProps) {
  const { preferences } = usePreferenceSync();
  const defaultTimeRange = preferences?.defaultTimeRange || '1h';

  return (
    <ErrorBoundary>
      <Card className={`p-6 ${className}`}>
        <Tabs defaultValue="realtime">
          <TabsList>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="aggregated">Aggregated</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">
            <div className="space-y-6">
              {metricTypes.map((type) => (
                <MetricsAggregationChart
                  key={type}
                  metricType={type}
                  title={`${type.toUpperCase()} Usage`}
                  className="h-[300px]"
                  refreshInterval={preferences?.refreshInterval}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="historical">
            <div className="space-y-6">
              {metricTypes.map((type) => (
                <HistoricalDataChart
                  key={type}
                  metricType={type}
                  title={`${type.toUpperCase()} History`}
                  className="h-[400px]"
                  showAlerts
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="aggregated">
            <div className="space-y-6">
              {metricTypes.map((type) => (
                <MetricsAggregationChart
                  key={type}
                  metricType={type}
                  title={`${type.toUpperCase()} Aggregation`}
                  className="h-[300px]"
                  window={defaultTimeRange}
                  showMinMax
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedMetricsChart
              metrics={metricTypes}
              title="System Metrics Comparison"
              className="h-[600px]"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </ErrorBoundary>
  );
} 