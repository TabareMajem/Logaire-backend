// src/components/monitoring/config/AlertsConfig.tsx -->

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Switch } from '../../../../components/ui/switch';
import type { MonitoringConfig } from '@/lib/monitoring/config/monitoring-config';
import { MonitoringConfigSchema } from '@/lib/monitoring/config/monitoring-config';
import { useEffect, useState } from 'react';

interface AlertsConfigProps {
  config: MonitoringConfig['alerts'];
  onSave: (updates: MonitoringConfig['alerts']) => void;
}

export function AlertsConfig({ config, onSave }: AlertsConfigProps) {
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
      MonitoringConfigSchema.shape.alerts.parse(formData);
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
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Email Notifications
            </span>
            <Switch
              checked={formData.enableEmailNotifications}
              onCheckedChange={checked => handleChange('enableEmailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Slack Notifications
            </span>
            <Switch
              checked={formData.enableSlackNotifications}
              onCheckedChange={checked => handleChange('enableSlackNotifications', checked)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Notification Endpoints</h3>
        <div className="mt-4 space-y-4">
          {formData.notificationEndpoints.map((endpoint, index) => (
            <div key={index} className="flex space-x-4">
              <Input
                type="url"
                value={endpoint}
                onChange={e => {
                  const endpoints = [...formData.notificationEndpoints];
                  endpoints[index] = e.target.value;
                  handleChange('notificationEndpoints', endpoints);
                }}
                className="flex-1"
                placeholder="https://..."
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const endpoints = formData.notificationEndpoints.filter((_, i) => i !== index);
                  handleChange('notificationEndpoints', endpoints);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              const endpoints = [...formData.notificationEndpoints, ''];
              handleChange('notificationEndpoints', endpoints);
            }}
          >
            Add Endpoint
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Alert Thresholds</h3>
        <div className="mt-4 space-y-4">
          {Object.entries(formData.thresholds).map(([metric, threshold]) => (
            <div key={metric} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{metric}</span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const { [metric]: _, ...rest } = formData.thresholds;
                    handleChange('thresholds', rest);
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Warning</label>
                  <Input
                    type="number"
                    value={threshold.warning}
                    onChange={e => {
                      const thresholds = {
                        ...formData.thresholds,
                        [metric]: {
                          ...threshold,
                          warning: parseFloat(e.target.value)
                        }
                      };
                      handleChange('thresholds', thresholds);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Critical</label>
                  <Input
                    type="number"
                    value={threshold.critical}
                    onChange={e => {
                      const thresholds = {
                        ...formData.thresholds,
                        [metric]: {
                          ...threshold,
                          critical: parseFloat(e.target.value)
                        }
                      };
                      handleChange('thresholds', thresholds);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Evaluation Period (s)
                  </label>
                  <Input
                    type="number"
                    value={threshold.evaluationPeriod}
                    onChange={e => {
                      const thresholds = {
                        ...formData.thresholds,
                        [metric]: {
                          ...threshold,
                          evaluationPeriod: parseInt(e.target.value)
                        }
                      };
                      handleChange('thresholds', thresholds);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
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