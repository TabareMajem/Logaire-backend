// src/components/admin/workflow/WorkflowDetails.tsx

import { useWorkflow } from '@/hooks/useWorkflow';
import { Card } from '@/components/ui/card';

interface WorkflowDetailsProps {
  workflowId: string;
}

export function WorkflowDetails({ workflowId }: WorkflowDetailsProps) {
  const { workflow, isLoading, error } = useWorkflow(workflowId);

  if (isLoading) {
    return <div>Loading workflow details...</div>;
  }

  if (error) {
    return <div>Error loading workflow details: {error.message}</div>;
  }

  if (!workflow) {
    return <div>No workflow found</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Workflow Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{workflow.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-medium">{workflow.status}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Created At</p>
          <p className="font-medium">
            {new Date(workflow.created_at).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Updated At</p>
          <p className="font-medium">
            {new Date(workflow.updated_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">Workflow Steps</h4>
        <div className="space-y-3">
          {workflow.steps?.map((step) => (
            <Card key={step.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{step.name}</p>
                  <p className="text-sm text-muted-foreground">{step.status}</p>
                </div>
                {step.error && (
                  <p className="text-sm text-red-500">{step.error}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}