// src/hooks/useAnalytics.tx -->

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalWorkflows: number;
  workflowTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  workflowHistory: Array<{ timestamp: string; value: number }>;
  workflowMetrics: Array<{
    timestamp: string;
    successRate: number;
    throughput: number;
    errorRate: number;
  }>;
  activeAgents: number;
  agentTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  agentHistory: Array<{ timestamp: string; value: number }>;
  systemHealth: number;
  healthTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  healthHistory: Array<{ timestamp: string; value: number }>;
}

interface UseAnalyticsOptions {
  dateRange: [Date, Date];
  metrics: string[];
}

interface UseAnalyticsResult {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
}

async function fetchAnalyticsData(options: UseAnalyticsOptions): Promise<AnalyticsData> {
  // In a real implementation, this would make an API call
  // For now, we'll return mock data
  const startDate = options.dateRange[0];
  const endDate = options.dateRange[1];
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const generateTimeseriesData = (baseValue: number, volatility: number) => {
    return Array.from({ length: days }, (_, i) => ({
      timestamp: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: baseValue + Math.random() * volatility - volatility / 2
    }));
  };

  const workflowHistory = generateTimeseriesData(100, 20);
  const agentHistory = generateTimeseriesData(50, 10);
  const healthHistory = generateTimeseriesData(95, 5);

  const calculateTrend = (history: Array<{ value: number }>) => {
    const first = history[0].value;
    const last = history[history.length - 1].value;
    const percentage = ((last - first) / first * 100).toFixed(1);
  
    // Explicitly cast the direction to one of the allowed string literals
    const direction: 'up' | 'down' | 'stable' = last > first
      ? 'up'
      : last < first
      ? 'down'
      : 'stable';
  
    return {
      direction,
      percentage: Math.abs(parseFloat(percentage))
    };
  };

  return {
    totalWorkflows: Math.floor(workflowHistory[workflowHistory.length - 1].value),
    workflowTrend: calculateTrend(workflowHistory),
    workflowHistory,
    workflowMetrics: Array.from({ length: days }, (_, i) => ({
      timestamp: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      successRate: 85 + Math.random() * 10,
      throughput: 1000 + Math.random() * 200,
      errorRate: Math.random() * 5
    })),
    activeAgents: Math.floor(agentHistory[agentHistory.length - 1].value),
    agentTrend: calculateTrend(agentHistory),
    agentHistory,
    systemHealth: Math.floor(healthHistory[healthHistory.length - 1].value),
    healthTrend: calculateTrend(healthHistory),
    healthHistory
  };
}

export function useAnalytics(options: UseAnalyticsOptions): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchAnalyticsData(options);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [options.dateRange[0], options.dateRange[1], options.metrics.join(',')]);

  return { data, isLoading, error };
}