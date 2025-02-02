done done

import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { customMetricsService } from '@/services/custom-metrics-service';
import { CustomMetricDefinition, CustomMetricFormula, MetricType } from '@/types/monitoring';
import { useEffect, useState } from 'react';
import { AggregatedMetricCard } from './AggregatedMetricCard';

export function CustomMetricsPanel() {
  const [definitions, setDefinitions] = useState<CustomMetricDefinition[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDefinition, setNewDefinition] = useState<Partial<CustomMetricDefinition>>({
    name: '',
    description: '',
    formula: JSON.stringify({
      operation: 'avg',
      metrics: ['cpu']
    } as CustomMetricFormula),
    baseMetrics: ['cpu'],
    unit: '%',
    enabled: true
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadDefinitions();
  }, []);

  const loadDefinitions = () => {
    const defs = customMetricsService.getDefinitions();
    setDefinitions(defs);
  };

  const handleCreateDefinition = async () => {
    try {
      await customMetricsService.createDefinition(newDefinition as Omit<CustomMetricDefinition, 'id' | 'createdAt' | 'updatedAt'>);
      setIsCreating(false);
      loadDefinitions();
      showToast({
        type: 'success',
        message: 'Custom metric created successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to create custom metric'
      });
    }
  };

  return (
    <ErrorBoundary>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Custom Metrics</h2>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              Create Metric
            </Button>
          </div>

          {isCreating && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={newDefinition.name}
                    onChange={(e) =>
                      setNewDefinition({ ...newDefinition, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    value={newDefinition.description}
                    onChange={(e) =>
                      setNewDefinition({ ...newDefinition, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Operation</label>
                  <Select
                    value={JSON.parse(newDefinition.formula || '{}').operation}
                    onValueChange={(value) =>
                      setNewDefinition({
                        ...newDefinition,
                        formula: JSON.stringify({
                          ...JSON.parse(newDefinition.formula || '{}'),
                          operation: value
                        })
                      })
                    }
                  >
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="max">Maximum</option>
                    <option value="min">Minimum</option>
                    <option value="multiply">Multiply</option>
                    <option value="divide">Divide</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Base Metrics</label>
                  <Select
                    multiple
                    value={newDefinition.baseMetrics}
                    onChange={(e) =>
                      setNewDefinition({
                        ...newDefinition,
                        baseMetrics: Array.from(e.target.selectedOptions).map(
                          (option) => option.value as MetricType
                        )
                      })
                    }
                  >
                    <option value="cpu">CPU Usage</option>
                    <option value="memory">Memory Usage</option>
                    <option value="disk">Disk Usage</option>
                    <option value="network">Network Traffic</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <Input
                    value={newDefinition.unit}
                    onChange={(e) =>
                      setNewDefinition({ ...newDefinition, unit: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateDefinition}>
                  Create Metric
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {definitions.map((definition) => (
              <AggregatedMetricCard
                key={definition.id}
                type={definition.baseMetrics[0]}
                title={definition.name}
                description={definition.description}
                thresholds={definition.thresholds}
              />
            ))}
          </div>
        </div>
      </Card>
    </ErrorBoundary>
  );
} 