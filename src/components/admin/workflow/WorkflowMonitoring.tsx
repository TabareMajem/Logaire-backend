// src/components/admin/workflow/WorkflowMonitoring.tsx -->

import { Badge } from '../../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../components/ui/table';
import { useWorkflows } from '@/hooks/useWorkflow';
import { formatDistanceToNow } from 'date-fns';
import { AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import { WorkflowDetails } from './WorkflowDetails';
import { WorkflowMetrics } from './WorkflowMetrics';
import { WorkflowVisualization } from './WorkflowVisualization';
import { Workflow } from '@/lib/ai/workflow/types';

export function WorkflowMonitoring() {
  const { workflows, isLoading, error } = useWorkflows();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'metrics' | 'visualization'>('details');

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Workflow Monitoring</h2>
          </div>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Error loading workflows: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Workflow Monitoring</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab('details')}
            className={activeTab === 'details' ? 'bg-primary text-primary-foreground' : ''}
          >
            Details
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('metrics')}
            className={activeTab === 'metrics' ? 'bg-primary text-primary-foreground' : ''}
          >
            Metrics
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('visualization')}
            className={activeTab === 'visualization' ? 'bg-primary text-primary-foreground' : ''}
          >
            Visualization
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow: Workflow) => (
  <TableRow
    key={workflow.id}
    className="cursor-pointer hover:bg-muted/50"
    onClick={() => setSelectedWorkflow(workflow.id)}
  >
    <TableCell className="font-medium">
      {workflow.name}
    </TableCell>
    <TableCell>
      <Badge
        variant={
          workflow.status === 'completed'
            ? 'secondary'
            : workflow.status === 'running'
            ? 'default'
            : workflow.status === 'failed'
            ? 'destructive'
            : 'secondary'
        }
      >
        {workflow.status}
      </Badge>
    </TableCell>
    <TableCell>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{
            width: `${calculateProgress(workflow)}%`
          }}
        />
      </div>
    </TableCell>
    <TableCell>
      {workflow.started_at && formatDistanceToNow(new Date(workflow.started_at), { addSuffix: true })}
    </TableCell>
    <TableCell>
      {calculateDuration(workflow)}
    </TableCell>
    <TableCell>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          // Handle workflow actions
        }}
      >
        Actions
      </Button>
    </TableCell>
  </TableRow>
))}
          </TableBody>
        </Table>
      </Card>

      {selectedWorkflow && (
        <Card className="p-6">
          {activeTab === 'details' && (
            <WorkflowDetails workflowId={selectedWorkflow} />
          )}
          {activeTab === 'metrics' && (
            <WorkflowMetrics workflowId={selectedWorkflow} />
          )}
          {activeTab === 'visualization' && (
            <WorkflowVisualization workflowId={selectedWorkflow} />
          )}
        </Card>
      )}
    </div>
  );
}

function calculateProgress(workflow: any): number {
  const completedSteps = workflow.steps.filter(
    (step: any) => step.status === 'completed'
  ).length;
  return Math.round((completedSteps / workflow.steps.length) * 100);
}

function calculateDuration(workflow: any): string {
  if (!workflow.startTime) return '-';
  const start = new Date(workflow.startTime);
  const end = workflow.endTime ? new Date(workflow.endTime) : new Date();
  const duration = end.getTime() - start.getTime();
  
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
} 