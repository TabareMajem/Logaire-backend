// src/components/admin/workflow/WorkflowMonitoringDashboard.tsx -->

import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useWorkflow, useWorkflows } from '@/hooks/useWorkflow';
import { workflowMonitoringService } from '@/services/workflow-monitoring-service';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AgentCollaborationView } from './AgentCollaborationView';
import { WorkflowList } from './WorkflowList';
import { WorkflowMetrics } from './WorkflowMetrics';
import { WorkflowVisualization } from './WorkflowVisualization';

export function WorkflowMonitoringDashboard() {
  const { workflows, isLoading, error } = useWorkflows();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedWorkflowId) return;

    const handleUpdate = (update: any) => {
      setRealtimeUpdates(prev => [...prev, update].slice(-5));
    };

    workflowMonitoringService.startMonitoring(selectedWorkflowId);
    workflowMonitoringService.on('workflowUpdate', handleUpdate);

    return () => {
      workflowMonitoringService.stopMonitoring(selectedWorkflowId);
      workflowMonitoringService.off('workflowUpdate', handleUpdate);
    };
  }, [selectedWorkflowId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load workflows: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const selectedWorkflow = workflows?.find((w: { id: string | null; }) => w.id === selectedWorkflowId);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workflow Monitoring</h1>
        <Button
          variant="outline"
          onClick={() => setSelectedWorkflowId(null)}
          disabled={!selectedWorkflowId}
        >
          Clear Selection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Active Workflows</h2>
            <WorkflowList
              workflows={workflows}
              selectedId={selectedWorkflowId}
              onSelect={setSelectedWorkflowId}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Real-time Updates</h2>
            <div className="space-y-2">
              {realtimeUpdates.map((update, i) => (
                <Alert key={i} variant={update.type === 'error' ? 'destructive' : 'default'}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>{update.type}</AlertTitle>
                  <AlertDescription>
                    {JSON.stringify(update.data)}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {selectedWorkflow && (
        <Card>
          <Tabs defaultValue="visualization" className="p-6">
            <TabsList>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="collaboration">Agent Collaboration</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization">
              <WorkflowVisualization workflowId={selectedWorkflow.id} />
            </TabsContent>

            <TabsContent value="metrics">
              <WorkflowMetrics workflowId={selectedWorkflow.id} />
            </TabsContent>

            <TabsContent value="collaboration">
              <AgentCollaborationView workflowId={selectedWorkflow.id} />
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
} 