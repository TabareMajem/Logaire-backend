// src/components/monitoring/alerts/AlertsPanel.tsx -->

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAlerts } from '@/hooks/useAlerts';
import { Alert } from '@/types/monitoring';
import { AlertBadge } from './AlertBadge';

export function AlertsPanel() {
  const {
    alerts,
    isLoading,
    error,
    acknowledgeAlert,
    resolveAlert
  } = useAlerts({ autoRefresh: true });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Failed to load alerts</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Active Alerts</h2>
        <div className="flex space-x-2">
          <AlertBadge count={alerts.filter(a => a.severity === 'high').length} severity="high" />
          <AlertBadge count={alerts.filter(a => a.severity === 'medium').length} severity="medium" />
          <AlertBadge count={alerts.filter(a => a.severity === 'low').length} severity="low" />
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={acknowledgeAlert}
            onResolve={resolveAlert}
          />
        ))}
      </div>
    </div>
  );
}

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
}

function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${
      alert.severity === 'high' ? 'border-red-200 bg-red-50' :
      alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
      'border-blue-200 bg-blue-50'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{alert.message}</h3>
          <p className="text-sm text-gray-500">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {alert.status === 'active' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(alert.id)}
              >
                Acknowledge
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolve(alert.id)}
              >
                Resolve
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 