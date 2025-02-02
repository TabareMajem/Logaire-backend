// src/components/admin/workflow/WorkflowMetrics.tsx -->

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflowMetrics } from '@/hooks/useWorkflowMetrics';
// import { formatDuration } from '@/lib/utils/format';
import { Duration, formatDuration } from 'date-fns';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface WorkflowMetricsProps {
  workflowId: string;
}

interface WorkflowMetrics {
  totalDuration: number;
  successRate: number;
  completedSteps: number;
  totalSteps: number;
  averageStepDuration: number;
  stepDurations: Array<{ name: string; duration: number }>;
  agentPerformance: Array<{
    timestamp: string;
    responseTime: number;
    successRate: number;
  }>;
  resourceUsage: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
  }>;
}

export function WorkflowMetrics({ workflowId }: WorkflowMetricsProps) {
  const { metrics, isLoading, error } = useWorkflowMetrics(workflowId);

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">Error loading workflow metrics</div>
      </Card>
    );
  }
  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Duration"
          value={formatDuration(metrics.totalDuration as Duration)}
        />
        <MetricCard
          title="Success Rate"
          value={`${Math.round(metrics.successRate * 100)}%`}
        />
        <MetricCard
          title="Steps Completed"
          value={`${metrics.completedSteps}/${metrics.totalSteps}`}
        />
        <MetricCard
          title="Average Step Duration"
          value={formatDuration(metrics.averageStepDuration as Duration)}
        />
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Step Duration Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.stepDurations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="duration" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Agent Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.agentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#3B82F6"
                name="Response Time"
              />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="#10B981"
                name="Success Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Resource Usage</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.resourceUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#3B82F6"
                name="CPU Usage"
              />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="#10B981"
                name="Memory Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Card>
  );
} 