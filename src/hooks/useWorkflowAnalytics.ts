import { useState, useEffect } from 'react';
import { OptimizationSuggestion } from '@/lib/ai/optimization/performance-optimizer';

interface WorkflowMetrics {
  executionTime: number;
  executionTimeTrend: 'up' | 'down' | 'stable';
  successRate: number;
  successRateTrend: 'up' | 'down' | 'stable';
  averageStepDuration: number;
  stepDurationTrend: 'up' | 'down' | 'stable';
  stepMetrics: {
    id: string;
    duration: number;
    errorRate: number;
  }[];
  resourceMetrics: {
    timestamp: string;
    cpu: number;
    memory: number;
  }[];
  suggestions: OptimizationSuggestion[];
}

interface WorkflowAnalyticsError extends Error {
  code?: string;
}

export function useWorkflowAnalytics(workflowId: string) {
  const [data, setData] = useState<WorkflowMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<WorkflowAnalyticsError | null>(null);

  useEffect(() => {
    async function fetchWorkflowAnalytics() {
      try {
        setIsLoading(true);
        setError(null);

        // Replace this with your actual API call
        const response = await fetch(`/api/workflows/${workflowId}/analytics`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch workflow analytics: ${response.statusText}`);
        }

        const analyticsData = await response.json();
        
        // Process and validate the data
        const processedData: WorkflowMetrics = {
          executionTime: analyticsData.executionTime,
          executionTimeTrend: analyticsData.executionTimeTrend,
          successRate: analyticsData.successRate,
          successRateTrend: analyticsData.successRateTrend,
          averageStepDuration: analyticsData.averageStepDuration,
          stepDurationTrend: analyticsData.stepDurationTrend,
          stepMetrics: analyticsData.stepMetrics,
          resourceMetrics: analyticsData.resourceMetrics,
          suggestions: analyticsData.suggestions,
        };

        setData(processedData);
      } catch (err) {
        const error = err as WorkflowAnalyticsError;
        setError({
          name: error.name || 'Error',
          message: error.message || 'An unknown error occurred',
          code: error.code,
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (workflowId) {
      fetchWorkflowAnalytics();
    }
  }, [workflowId]);

  return {
    data,
    isLoading,
    error,
  };
}