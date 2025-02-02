"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Archive, Trash } from 'lucide-react';

interface NotificationActionsProps {
  notification: any;
}

export function NotificationActions({ notification }: NotificationActionsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();


  const { mutate: markAsRead } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notification.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin-notifications']});
      toast.success('Notification marked as read');
    },
    onError: () => {
      toast.error('Failed to update notification');
    }
  });

  const { mutate: archiveNotification } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ archived: true })
        .eq('id', notification.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin-notifications']});
      toast.success('Notification archived');
    },
    onError: () => {
      toast.error('Failed to archive notification');
    }
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notification.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin-notifications']});
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => markAsRead()}>
          <Eye className="mr-2 h-4 w-4" />
          Mark as Read
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => archiveNotification()}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => deleteNotification()}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}