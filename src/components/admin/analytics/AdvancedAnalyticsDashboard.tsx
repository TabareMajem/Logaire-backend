import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useAnalytics } from '@/hooks/useAnalytics';
import { generateReport } from '@/lib/admin/report-generator';
import { Download, Filter } from 'lucide-react';
import { useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export function AdvancedAnalyticsDashboard() {
  // Update the date state to match DateRangePicker's expected format
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'workflows',
    'agents',
    'integrations'
  ]);

  // Convert the date range format for the useAnalytics hook
  const { data, isLoading, error } = useAnalytics({
    dateRange: [dateRange.from, dateRange.to],
    metrics: selectedMetrics
  });

  const handleExport = async () => {
    if (!data) return;
    
    const report = await generateReport({
      type: 'analytics',
      data,
      dateRange: [dateRange.from, dateRange.to],
      metrics: selectedMetrics
    });
    
    const url = window.URL.createObjectURL(report);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analytics-report-${dateRange.from.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Handle date range changes
  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <div className="flex items-center space-x-4">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Open filters modal */}}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            disabled={!data}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricsCard
                title="Total Workflows"
                value={data.totalWorkflows || 0}
                trend={data.workflowTrend || { direction: 'stable', percentage: 0 }}
                chart={data.workflowHistory || []}
              />
              <MetricsCard
                title="Active Agents"
                value={data.activeAgents || 0}
                trend={data.agentTrend || { direction: 'stable', percentage: 0 }}
                chart={data.agentHistory || []}
              />
              <MetricsCard
                title="System Health"
                value={`${data.systemHealth || 0}%`}
                trend={data.healthTrend || { direction: 'stable', percentage: 0 }}
                chart={data.healthHistory || []}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Workflow Performance</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.workflowMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Success Rate"
                    stroke="#10B981"
                  />
                  <Line
                    type="monotone"
                    dataKey="throughput"
                    name="Throughput"
                    stroke="#3B82F6"
                  />
                  <Line
                    type="monotone"
                    dataKey="errorRate"
                    name="Error Rate"
                    stroke="#EF4444"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


interface MetricsCardProps {
    title: string;
    value: number | string;
    trend: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
    chart: any[];
  }
  
  function MetricsCard({ title, value, trend, chart }: MetricsCardProps) {
    return (
      <Card className="p-4">
        <div className="mb-4">
          <h3 className="text-sm text-gray-500">{title}</h3>
          <div className="text-2xl font-semibold">{value}</div>
          <div className={`text-sm ${getTrendColor(trend.direction)}`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
            {' '}
            {trend.percentage}%
          </div>
        </div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }
  
  function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  } 