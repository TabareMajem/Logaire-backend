import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useWorkflow } from '@/hooks/useWorkflow';
import { AlertCircle } from 'lucide-react';
import { CollaborationDashboard } from './CollaborationDashboard';
import { WorkflowAnalyticsDashboard } from './WorkflowAnalyticsDashboard';
import { WorkflowVisualization } from './WorkflowVisualization';
import { Badge } from '../../../../components/ui/badge';

interface WorkflowMonitoringViewProps {
  workflowId: string;
}

export function WorkflowMonitoringView({ workflowId }: WorkflowMonitoringViewProps) {
  const { workflow, isLoading, error } = useWorkflow(workflowId);

  if (isLoading) {
    return <div>Loading workflow data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load workflow: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Workflow: {workflow?.name}
        </h1>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(workflow?.status ?? 'default') as 'default' | 'destructive' | 'secondary' | 'outline'}>
            {workflow?.status}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="visualization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization">
          <Card className="p-6">
            <WorkflowVisualization workflowId={workflowId} />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <WorkflowAnalyticsDashboard workflowId={workflowId} />
        </TabsContent>

        <TabsContent value="collaboration">
          <CollaborationDashboard workflowId={workflowId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusVariant(status: string): 'default' | 'success' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'destructive';
    default:
      return 'default';
  }
} 