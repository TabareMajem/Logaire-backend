// src/components/dashboard/tasks/task-board.tsx -->

"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { groupBy } from 'lodash';
import { Task, TaskStatus, fetchTasks, updateTaskStatus } from '@/lib/api/tasks';
import { TaskColumn } from './task-column';
import { useToast } from '@/hooks/use-toast';

export function TaskBoard() {
  const { toast } = useToast();
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });

  const grouped = useMemo(() => {
    if (!tasks) return {};
    return groupBy(tasks, 'status');
  }, [tasks]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;

    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-32 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {(['todo', 'in_progress', 'completed', 'blocked'] as TaskStatus[]).map((status) => (
        <TaskColumn
          key={status}
          status={status}
          tasks={grouped[status] || []}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}