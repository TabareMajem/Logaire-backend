// src/components/monitoring/alerts/AlertRulesManager.tsx -->

import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { AlertRule, AlertSeverity, MetricType } from '@/types/monitoring';
import { useState } from 'react';

interface AlertRulesManagerProps {
  rules: AlertRule[];
  onAddRule: (rule: AlertRule) => Promise<void>;
  onUpdateRule: (id: string, rule: Partial<AlertRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}

export function AlertRulesManager({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule
}: AlertRulesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    metricType: 'cpu',
    condition: 'above',
    threshold: 90,
    severity: 'high',
    enabled: true
  });
  const { showToast } = useToast();

  const handleAddRule = async () => {
    try {
      await onAddRule(newRule as AlertRule);
      setIsAdding(false);
      setNewRule({
        metricType: 'cpu',
        condition: 'above',
        threshold: 90,
        severity: 'high',
        enabled: true
      });
      showToast({
        type: 'success',
        message: 'Alert rule added successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to add alert rule'
      });
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<AlertRule>) => {
    try {
      await onUpdateRule(id, updates);
      showToast({
        type: 'success',
        message: 'Alert rule updated successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to update alert rule'
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await onDeleteRule(id);
      showToast({
        type: 'success',
        message: 'Alert rule deleted successfully'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to delete alert rule'
      });
    }
  };

  return (
    <ErrorBoundary>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Alert Rules</h2>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              Add Rule
            </Button>
          </div>

          {isAdding && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Metric Type
                  </label>
                  <Select
                    value={newRule.metricType}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, metricType: value as MetricType })
                    }
                  >
                    <option value="cpu">CPU Usage</option>
                    <option value="memory">Memory Usage</option>
                    <option value="disk">Disk Usage</option>
                    <option value="network">Network Traffic</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Condition
                  </label>
                  <Select
                    value={newRule.condition}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, condition: value as "above" | "below" | "equals"})
                    }
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                    <option value="equals">Equals</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Threshold
                  </label>
                  <Input
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        threshold: parseFloat(e.target.value)
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Severity
                  </label>
                  <Select
                    value={newRule.severity}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, severity: value as AlertSeverity })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddRule}>
                  Add Rule
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {rule.metricType.toUpperCase()} {rule.condition} {rule.threshold}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Severity: {rule.severity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateRule(rule.id, {
                          enabled: !rule.enabled
                        })
                      }
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </ErrorBoundary>
  );
} 