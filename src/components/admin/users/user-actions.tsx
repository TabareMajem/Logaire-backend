// src/components/admin/users/user-actions.tsx -->

"use client";

import { useState } from 'react';
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
import { MoreHorizontal, Edit, Lock, Ban, Trash } from 'lucide-react';
import { EditUserDialog } from './edit-user-dialog';

interface UserActionsProps {
  user: any;
}

export function UserActions({ user }: UserActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateUserStatus } = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
      toast.success('User status updated');
    },
    onError: () => {
      toast.error('Failed to update user status');
    }
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
      toast.success('User deleted');
    },
    onError: () => {
      toast.error('Failed to delete user');
    }
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateUserStatus('suspended')}>
            <Ban className="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateUserStatus('active')}>
            <Lock className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => deleteUser()}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        user={user}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
}