done done

import { MonitoringConfigManager } from '@/lib/monitoring/config/monitoring-config';
import { useEffect, useState } from 'react';
import { MetricsChart } from './MetricsChart';

const CHART_COLORS = {
  cpu: 'rgb(255, 99, 132)',
  memory: 'rgb(54, 162, 235)',
  requests: 'rgb(75, 192, 192)',
  errors: 'rgb(255, 159, 64)'
};

export function MetricsGrid() {
  const [enabledMetrics, setEnabledMetrics] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('1h');
  const configManager = MonitoringConfigManager.getInstance();

  useEffect(() => {
    const loadConfig = async () => {
      await configManager.loadConfig();
      setEnabledMetrics(configManager.getConfig().metrics.enabledMetrics);
    };

    loadConfig();

    const unsubscribe = configManager.subscribe(config => {
      setEnabledMetrics(config.metrics.enabledMetrics);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        {['1h', '6h', '24h'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {enabledMetrics.map(metric => (
          <MetricsChart
            key={metric}
            title={metric.charAt(0).toUpperCase() + metric.slice(1)}
            metric={metric}
            timeRange={timeRange}
            color={CHART_COLORS[metric as keyof typeof CHART_COLORS]}
          />
        ))}
      </div>
    </div>
  );
} 