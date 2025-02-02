// src/components/ai/dashboard/agent-config-dialog.tsx -->

"use client";

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../../../components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../../../components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-sonner';
import * as z from 'zod';

const agentConfigSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  settings: z.object({
    minConfidence: z.number().min(0).max(1),
    maxLatency: z.number().min(0),
    priority: z.enum(['low', 'medium', 'high']),
    customPrompt: z.string().optional()
  })
});

type AgentConfigFormData = z.infer<typeof agentConfigSchema>;

interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: string | null;
}

export function AgentConfigDialog({
  open,
  onOpenChange,
  agentType
}: AgentConfigDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: {
      name: '',
      description: '',
      settings: {
        minConfidence: 0.8,
        maxLatency: 1000,
        priority: 'medium',
        customPrompt: ''
      }
    }
  });

  const { data: agentConfig, isLoading } = useQuery({
    queryKey: ['agent-config', agentType],
    queryFn: async () => {
      if (!agentType) return null;
      const response = await fetch(`/api/ai/agents/${agentType}/config`);
      if (!response.ok) throw new Error('Failed to fetch agent configuration');
      return response.json();
    },
    enabled: !!agentType
  });

  const mutation = useMutation({
    mutationFn: async (data: AgentConfigFormData) => {
      if (!agentType) throw new Error('No agent type specified');
      const response = await fetch(`/api/ai/agents/${agentType}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-config', agentType] });
      toast.success('Agent configuration updated');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update agent configuration');
    }
  });

  const onSubmit = (data: AgentConfigFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agent Configuration</DialogTitle>
          <DialogDescription>
            Configure the agent settings and behavior.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.minConfidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Confidence</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum confidence score required for task completion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.customPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Prompt Template</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom prompt template for this agent (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 