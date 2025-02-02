// src/components/monitoring/dashboard/MetricsOverview.tsx -->

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePreferenceSync } from '@/hooks/usePreferenceSync';
import { metricsAggregationService } from '@/services/metrics-aggregation-service';
import { MetricType } from '@/types/monitoring';
import { useEffect, useState } from 'react';
import { MonitoringErrorBoundary } from '../common/MonitoringErrorBoundary';
import { AggregatedMetricCard } from '../metrics/AggregatedMetricCard';

interface MetricsOverviewProps {
  className?: string;
}

export function MetricsOverview({ className }: MetricsOverviewProps) {
  const { preferences } = usePreferenceSync();
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(
    preferences?.defaultMetrics || ['cpu', 'memory']
  );
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    if (preferences?.defaultMetrics) {
      setSelectedMetrics(preferences.defaultMetrics);
    }
  }, [preferences?.defaultMetrics]);

  const toggleMetric = (metric: MetricType) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const handleSaveCustomization = async () => {
    try {
      await metricsAggregationService.updateMetricsConfig({
        enabledMetrics: selectedMetrics
      });
      setIsCustomizing(false);
    } catch (error) {
      console.error('Failed to save metrics configuration:', error);
    }
  };

  return (
    <MonitoringErrorBoundary>
      <Card className={`p-6 ${className}`}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Metrics</h2>
            <Button
              variant="outline"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              {isCustomizing ? 'Cancel' : 'Customize'}
            </Button>
          </div>

          {isCustomizing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['cpu', 'memory', 'disk', 'network'] as MetricType[]).map((metric) => (
                  <Button
                    key={metric}
                    variant={selectedMetrics.includes(metric) ? 'default' : 'outline'}
                    onClick={() => toggleMetric(metric)}
                  >
                    {metric.toUpperCase()}
                  </Button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveCustomization}>
                  Save Configuration
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedMetrics.map((metric) => (
                <AggregatedMetricCard
                  key={metric}
                  type={metric}
                  title={`${metric.toUpperCase()} Usage`}
                  window="5m"
                  thresholds={preferences?.thresholds?.[metric]}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </MonitoringErrorBoundary>
  );
} 