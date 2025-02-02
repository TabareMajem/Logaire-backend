// src/components/monitoring/config/MetricsConfig.tsx -->

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Switch } from '../../../../components/ui/switch';
import type { MonitoringConfig } from '@/lib/monitoring/config/monitoring-config';
import { MonitoringConfigSchema } from '@/lib/monitoring/config/monitoring-config';
import { useEffect, useState } from 'react';

interface MetricsConfigProps {
  config: MonitoringConfig['metrics'];
  onSave: (updates: MonitoringConfig['metrics']) => void;
}

export function MetricsConfig({ config, onSave }: MetricsConfigProps) {
  const [formData, setFormData] = useState(config);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate using Zod schema
      MonitoringConfigSchema.shape.metrics.parse(formData);
      onSave(formData);
      setErrors({});
    } catch (error: any) {
      const formattedErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        formattedErrors[err.path.join('.')] = err.message;
      });
      setErrors(formattedErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Collection Settings</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Collection Interval (ms)
            </label>
            <Input
              type="number"
              value={formData.collectionInterval}
              onChange={e => handleChange('collectionInterval', parseInt(e.target.value))}
              min={1000}
              max={60000}
              className={errors.collectionInterval ? 'border-red-500' : ''}
            />
            {errors.collectionInterval && (
              <p className="mt-1 text-sm text-red-500">{errors.collectionInterval}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Retention Period (days)
            </label>
            <Input
              type="number"
              value={formData.retentionDays}
              onChange={e => handleChange('retentionDays', parseInt(e.target.value))}
              min={1}
              max={365}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Enabled Metrics</h3>
        <div className="mt-4 space-y-2">
          {['cpu', 'memory', 'requests', 'errors'].map(metric => (
            <div key={metric} className="flex items-center">
              <Switch
                checked={formData.enabledMetrics.includes(metric)}
                onCheckedChange={(checked) => {
                  const metrics = checked
                    ? [...formData.enabledMetrics, metric]
                    : formData.enabledMetrics.filter(m => m !== metric);
                  handleChange('enabledMetrics', metrics);
                }}
              />
              <span className="ml-2 text-sm">{metric}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Aggregation Rules</h3>
        <div className="mt-4 space-y-4">
          {formData.aggregationRules.map((rule, index) => (
            <div key={index} className="flex space-x-4">
              <Input
                value={rule.metric}
                onChange={e => {
                  const rules = [...formData.aggregationRules];
                  rules[index] = { ...rule, metric: e.target.value };
                  handleChange('aggregationRules', rules);
                }}
                placeholder="Metric name"
              />
              <select
                value={rule.function}
                onChange={e => {
                  const rules = [...formData.aggregationRules];
                  rules[index] = { ...rule, function: e.target.value as any };
                  handleChange('aggregationRules', rules);
                }}
                className="rounded-md border border-gray-300"
              >
                <option value="avg">Average</option>
                <option value="sum">Sum</option>
                <option value="max">Max</option>
                <option value="min">Min</option>
              </select>
              <Input
                value={rule.interval}
                onChange={e => {
                  const rules = [...formData.aggregationRules];
                  rules[index] = { ...rule, interval: e.target.value };
                  handleChange('aggregationRules', rules);
                }}
                placeholder="Interval (e.g., 1m, 5m)"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const rules = formData.aggregationRules.filter((_, i) => i !== index);
                  handleChange('aggregationRules', rules);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              const rules = [...formData.aggregationRules, {
                metric: '',
                interval: '1m',
                function: 'avg'
              }];
              handleChange('aggregationRules', rules);
            }}
          >
            Add Rule
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="default">
          Save Changes
        </Button>
      </div>
    </form>
  );
} 