// src/components/admin/workflow/WorkflowAnalyticsDashboard.tsx -->

import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useWorkflowAnalytics } from '@/hooks/useWorkflowAnalytics';
import { OptimizationSuggestion } from '@/lib/ai/optimization/performance-optimizer';
import { formatDuration } from 'date-fns';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
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
    YAxis
} from 'recharts';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from 'react';

interface WorkflowAnalyticsDashboardProps {
  workflowId: string;
}

export function WorkflowAnalyticsDashboard({ workflowId }: WorkflowAnalyticsDashboardProps) {
  const { data, isLoading, error } = useWorkflowAnalytics(workflowId);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load workflow analytics: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMetrics data={data} />
        </TabsContent>

        <TabsContent value="optimization">
          <OptimizationSuggestions suggestions={data?.suggestions} />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceUtilization data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PerformanceMetrics({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Execution Time"
          value={formatDuration(data.executionTime)}
          trend={data.executionTimeTrend}
        />
        <MetricCard
          title="Success Rate"
          value={`${(data.successRate * 100).toFixed(1)}%`}
          trend={data.successRateTrend}
        />
        <MetricCard
          title="Avg Step Duration"
          value={formatDuration(data.averageStepDuration)}
          trend={data.stepDurationTrend}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Step Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.stepMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="duration" name="Duration" fill="#3B82F6" />
              <Bar dataKey="errorRate" name="Error Rate" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// function OptimizationSuggestions({ suggestions }: { suggestions: OptimizationSuggestion[] }) {
function OptimizationSuggestions({ suggestions = [] }: { suggestions?: OptimizationSuggestion[] }) {
  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant={getBadgeVariant(suggestion.priority)}>
                  {suggestion.priority}
                </Badge>
                <h4 className="text-lg font-medium">{suggestion.description}</h4>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Expected Impact: {suggestion.impact.performance}% performance improvement
              </div>
              <div className="mt-4">
                <h5 className="font-medium mb-2">Implementation Steps:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {suggestion.implementation.steps.map((step: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined, i: Key | null | undefined) => (
                    <li key={i} className="text-sm">{step}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Apply
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ResourceUtilization({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Resource Usage Over Time</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.resourceMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU Usage"
                stroke="#3B82F6"
              />
              <Line
                type="monotone"
                dataKey="memory"
                name="Memory Usage"
                stroke="#10B981"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, trend }: {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}) {
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className={`flex items-center mt-2 text-sm ${getTrendColor(trend)}`}>
        {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
         trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
        {trend}
      </div>
    </Card>
  );
}

function getBadgeVariant(priority: string): 'default' | 'secondary' | 'destructive' {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    default:
      return 'default';
  }
}

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'up':
      return 'text-green-500';
    case 'down':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
} 