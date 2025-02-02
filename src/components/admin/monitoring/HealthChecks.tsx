import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'pending';
  lastChecked: string;
  details?: string;
}

export function HealthChecks() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealthChecks = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API call
        const response = await fetch('/api/system/health');
        if (!response.ok) {
          throw new Error('Failed to fetch health checks');
        }
        const data = await response.json();
        setChecks(data);
      } catch (error) {
        console.error('Error fetching health checks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthChecks();
    const interval = setInterval(fetchHealthChecks, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div>Loading health checks...</div>;
  }

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'unhealthy':
        return 'bg-red-50 border-red-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {checks.map((check) => (
        <Card
          key={check.id}
          className={`p-4 ${getStatusClass(check.status)}`}
        >
          <div className="flex items-start gap-3">
            {getStatusIcon(check.status)}
            <div>
              <h3 className="font-semibold">{check.name}</h3>
              {check.details && (
                <p className="mt-1 text-sm text-gray-600">{check.details}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Last checked: {new Date(check.lastChecked).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}