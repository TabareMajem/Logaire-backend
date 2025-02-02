// src/components/admin/workflow/WorkflowList.tsx

import { Button } from '@/components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Clock, Play, Pause, AlertCircle } from 'lucide-react';
import { Workflow } from '@/lib/ai/workflow/types';

interface WorkflowListProps {
  workflows: Workflow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function WorkflowList({ workflows, selectedId, onSelect }: WorkflowListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2">
        {workflows.map((workflow) => (
          <Button
            key={workflow.id}
            variant={selectedId === workflow.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-left",
              selectedId === workflow.id && "bg-secondary"
            )}
            onClick={() => onSelect(workflow.id)}
          >
            <div className="flex items-center gap-3 w-full">
              {getStatusIcon(workflow.status)}
              <div className="flex-1">
                <p className="font-medium">{workflow.name || `Workflow ${workflow.id}`}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Status: {workflow.status}</span>
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}