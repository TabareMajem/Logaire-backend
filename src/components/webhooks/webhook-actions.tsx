"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';
import { MoreHorizontal, Power, PowerOff, Trash } from 'lucide-react';
import { Toast, ToastTitle, ToastDescription } from '../../../components/ui/toast';

interface WebhookActionsProps {
  webhook: {
    id: string;
    name: string;
    status: string;
  };
}

export function WebhookActions({ webhook }: WebhookActionsProps) {
  const queryClient = useQueryClient();

  const updateWebhookMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'active' | 'inactive';
    }) => {
      
      const { error } = await supabase
        .from('webhooks')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      Toast({
        children: (
          <>
            <ToastTitle>Webhook status updated</ToastTitle>
          </>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: (error: any) => {
      Toast({
        children: (
          <>
            <ToastTitle>Error updating webhook</ToastTitle>
            <ToastDescription>{error.message}</ToastDescription>
          </>
        ),
        variant: 'destructive',
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      
      const { error } = await supabase.from('webhooks').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      Toast({
        children: (
          <>
            <ToastTitle>Webhook deleted successfully</ToastTitle>
          </>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: (error: any) => {
      Toast({
        children: (
          <>
            <ToastTitle>Error deleting webhook</ToastTitle>
            <ToastDescription>{error.message}</ToastDescription>
          </>
        ),
        variant: 'destructive',
      });
    },
  });

  const handleStatusToggle = () => {
    const newStatus = webhook.status === 'active' ? 'inactive' : 'active';
    updateWebhookMutation.mutate({ id: webhook.id, status: newStatus });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the webhook "${webhook.name}"?`)) {
      deleteWebhookMutation.mutate(webhook.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleStatusToggle}>
          {webhook.status === 'active' ? (
            <>
              <PowerOff className="mr-2 h-4 w-4" />
              Disable Webhook
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              Enable Webhook
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 dark:text-red-400"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete Webhook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}