"use client";

import { AlertCircle, AlertTriangle, BellRing } from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert';

type APIAlert = {
  id: string;
  service: string;
  type: string;
  severity: string;
  message: string;
  created_at: string;
};

interface AlertsListProps {
  alerts: APIAlert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (!alerts?.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        <p>No active alerts</p>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellRing className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-900 dark:bg-red-900/10 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-200';
      default:
        return 'bg-blue-50 text-blue-900 dark:bg-blue-900/10 dark:text-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            className={`${getSeverityColor(alert.severity)} border-none`}
          >
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 space-y-1">
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.service}</span>
                  <span className="text-xs font-normal">
                    {formatDate(alert.created_at)}
                  </span>
                </AlertTitle>
                <AlertDescription className="text-sm">
                  {alert.message}
                </AlertDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                    {alert.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                    {alert.severity}
                  </span>
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </div>
    </ScrollArea>
  );
}