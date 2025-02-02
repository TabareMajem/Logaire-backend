import { useState, useEffect } from 'react';

export interface MetricHistory {
  timestamp: string;
  value: number;
}

export interface MetricData {
  current: number;
  history: MetricHistory[];
}

export interface SystemMetrics {
  cpu?: MetricData;
  memory?: MetricData;
  disk?: MetricData;
  network?: MetricData;
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        // Replace this with your actual API call
        const response = await fetch('/api/system/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch system metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics, isLoading, error };
}