import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export function AlertsList() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API call
        const response = await fetch('/api/system/alerts');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        const data = await response.json();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  const getSeverityIcon = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500">No active alerts</div>
        ) : (
          alerts.map((alert) => (
            <Alert
              key={alert.id}
              className={`${getSeverityClass(alert.severity)} border-l-4`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div>
                  <AlertTitle className="text-sm font-semibold">
                    {alert.title}
                  </AlertTitle>
                  <AlertDescription className="mt-1 text-sm">
                    {alert.description}
                  </AlertDescription>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </Alert>
          ))
        )}
      </div>
    </ScrollArea>
  );
}