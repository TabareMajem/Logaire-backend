"use client";

import { Task } from '@/lib/api/tasks';
import { TaskProgress } from './task-progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailsDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig = {
  low: { color: 'bg-blue-500', label: 'Low' },
  medium: { color: 'bg-yellow-500', label: 'Medium' },
  high: { color: 'bg-orange-500', label: 'High' },
  urgent: { color: 'bg-red-500', label: 'Urgent' },
} as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const priorityBadge = priorityConfig[task.priority];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle>{task.title}</DialogTitle>
            <Badge className={priorityBadge.color}>
              {priorityBadge.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {task.description}
          </p>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assigned_to.avatar_url} />
                <AvatarFallback>{getInitials(task.assigned_to.name)}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">
                Assigned to {task.assigned_to.name}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due {format(new Date(task.due_date), 'PPP')}</span>
            </div>
          </div>

          <TaskProgress taskId={task.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}