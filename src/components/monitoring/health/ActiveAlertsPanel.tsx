// src/components/monitoring/health/ActiveAlertsPanel.tsx -->

import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
}

interface ActiveAlertsPanelProps {
  alerts: Alert[];
}

export function ActiveAlertsPanel({ alerts }: ActiveAlertsPanelProps) {
  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Active Alerts</h3>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-gray-500">No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-medium">
                {alert.severity.toUpperCase()} Alert
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))
        )}
      </div>
    </Card>
  );
}