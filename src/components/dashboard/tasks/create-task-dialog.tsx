"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskFormData } from '@/lib/validations/task';
import { createTask, Task } from '@/lib/api/tasks';
import { useToast } from '@/hooks/use-toast';
import { TaskForm } from './task-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog';

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<Task, Error, TaskFormData>({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['tasks'] 
      });
      toast.success('Task created successfully');
      setOpen(false);
    },
    onError: () => {
      toast.error('Failed to create task');
    }
  });

  const handleSubmit = async (data: TaskFormData) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <TaskForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}