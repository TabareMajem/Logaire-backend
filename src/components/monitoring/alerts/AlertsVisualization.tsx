// src/components/monitoring/alerts/AlertsVisualization.tsx -->

import { useMonitoringSocket } from '@/hooks/useMonitoringSocket';
import { Alert } from '@/lib/monitoring/alerts/alert-manager';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AlertBadge } from './AlertBadge';
import { AlertChart } from './AlertChart';

interface AlertsVisualizationProps {
  className?: string;
}

export function AlertsVisualization({ className }: AlertsVisualizationProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const socket = useMonitoringSocket();

  useEffect(() => {
    // Load initial alerts
    loadAlerts();
    // Subscribe to real-time updates
    socket.subscribe(['alerts'], (data) => {
      // Type cast the monitoring event to Alert since we know this is alerts channel
      handleAlertUpdate(data as unknown as Alert); 
    });

    return () => {
      socket.unsubscribe(['alerts']);
    };
  }, []);

  const loadAlerts = async () => {
    const response = await fetch('/api/monitoring/alerts');
    const data = await response.json();
    setAlerts(data);
  };

  const handleAlertUpdate = (update: Alert) => {
    setAlerts(prev => {
      // Remove resolved alerts
      const filtered = prev.filter(a => !a.resolved);
      // Add new alert
      return [update, ...filtered];
    });
  };

  const getAlertsByMetric = () => {
    const grouped = alerts.reduce<Record<string, Alert[]>>((acc, alert) => {
      const metric = alert.metric as unknown as string;
      if (!acc[metric]) {
        acc[metric] = [];
      }
      acc[metric].push(alert);
      return acc;
    }, {} as Record<string, Alert[]>);

    return Object.entries(grouped).map(([metric, alerts]) => ({
      metric,
      count: alerts.length,
      severity: alerts.reduce((max, alert) => 
        alert.severity === 'high' ? 'high' : 
        max === 'medium' ? max : alert.severity
      , 'low' as Alert['severity'])
    }));
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {getAlertsByMetric().map(({ metric, count, severity }) => (
          <motion.div
            key={metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              severity === 'high' ? 'bg-red-50' :
              severity === 'medium' ? 'bg-yellow-50' :
              'bg-green-50'
            }`}
            onClick={() => setSelectedMetric(metric === selectedMetric ? null : metric)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{metric}</span>
              <AlertBadge severity={severity} count={count} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {alerts
            .filter(alert => !selectedMetric || String(alert.metric) === selectedMetric)
            .map(alert => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{String(alert.metric)}</h3>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(alert.timestamp))} ago
                    </p>
                  </div>
                  <AlertBadge severity={alert.severity} />
                </div>
                <p className="mt-2 text-sm">
                  {/* {alert.metric} is {alert.condition} threshold ({alert.value} vs {alert.threshold}) */}
                </p>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {selectedMetric && (
        <div className="mt-6">
          <AlertChart
            metric={selectedMetric}
            alerts={alerts.filter(a => String(a.metric) === selectedMetric)}
          />
        </div>
      )}
    </div>
  );
} 