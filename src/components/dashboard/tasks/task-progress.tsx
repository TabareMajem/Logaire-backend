// src/components/dashboard/tasks/task-progress.tsx -->

"use client";

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Task } from '@/lib/api/tasks';
import { fetchTaskById, updateTaskChecklist } from '@/lib/api/tasks';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../../../../components/ui/progress';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Card } from '../../../../components/ui/card';
import { cn } from '@/lib/utils';

interface TaskProgressProps {
  taskId: string;
}

export function TaskProgress({ taskId }: TaskProgressProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => fetchTaskById(taskId)
  });

  const { mutate: updateChecklist } = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      updateTaskChecklist(taskId, itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['tasks', taskId]});
      toast.success('Progress updated');
    },
    onError: () => {
      toast.error('Failed to update progress');
    }
  });

  const progress = useMemo(() => {
    if (!task?.checklist.length) return 0;
    const completed = task.checklist.filter(item => item.completed).length;
    return (completed / task.checklist.length) * 100;
  }, [task?.checklist]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-2 bg-muted rounded" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!task?.checklist.length) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          No checklist items
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-2">
        {task.checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-start space-x-3"
          >
            <Checkbox
              id={item.id}
              checked={item.completed}
              onCheckedChange={(checked) => {
                updateChecklist({
                  itemId: item.id,
                  completed: checked as boolean
                });
              }}
              className="mt-0.5"
            />
            <label
              htmlFor={item.id}
              className={cn(
                "text-sm flex-1 cursor-pointer",
                item.completed && "line-through text-muted-foreground"
              )}
            >
              {item.text}
            </label>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Last updated {formatDistanceToNow(new Date(task.updated_at))} ago
      </div>
    </div>
  );
}