// src/components/dashboard/tasks/task-card.tsx -->

"use client";

import { formatDistanceToNow } from 'date-fns';
import { Task } from '@/lib/api/tasks';
import { Card } from '@/components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Progress } from '../../../../components/ui/progress';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  className?: string;
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

function getCompletedPercentage(checklist: Task['checklist']): number {
  if (checklist.length === 0) return 0;
  const completed = checklist.filter((item: { completed: any; }) => item.completed).length;
  return Math.round((completed / checklist.length) * 100);
}

export function TaskCard({ task, className }: TaskCardProps) {
  const priorityBadge = priorityConfig[task.priority];
  const completedPercentage = getCompletedPercentage(task.checklist);

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        </div>
        <Badge className={cn("ml-2", priorityBadge.color)}>
          {priorityBadge.label}
        </Badge>
      </div>

      {task.checklist.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedPercentage}%</span>
          </div>
          <Progress value={completedPercentage} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assigned_to.avatar_url} />
            <AvatarFallback>{getInitials(task.assigned_to.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {task.assigned_to.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Due {formatDistanceToNow(new Date(task.due_date))}
        </span>
      </div>
    </Card>
  );
}