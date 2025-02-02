// src/components/dashboard/tasks/task-column.tsx -->

"use client";

import { Task, TaskStatus } from '@/lib/api/tasks';
import { TaskCard } from './task-card';
import { Badge } from '../../../../components/ui/badge';
import { DropResult } from 'react-beautiful-dnd';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
}

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-slate-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
  blocked: { label: 'Blocked', color: 'bg-red-500' },
} as const;

export function TaskColumn({ status, tasks, onDragEnd }: TaskColumnProps) {
  const config = statusConfig[status];

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">{config.label}</h3>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}