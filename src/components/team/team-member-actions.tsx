// src/components/team/team-member-actions.tsx -->

"use client";

import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '../../../components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Toast, ToastTitle, ToastDescription, ToastViewport, ToastProvider } from '../../../components/ui/toast';

interface TeamMemberActionsProps {
  member: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export function TeamMemberActions({ member }: TeamMemberActionsProps) {
  const queryClient = useQueryClient();

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      Toast({
        children: (
          <>
            <ToastTitle>Team member removed successfully</ToastTitle>
          </>
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      Toast({
        children: (
          <>
            <ToastTitle>Error removing team member</ToastTitle>
            <ToastDescription>{error.message}</ToastDescription>
          </>
        ),
        variant: 'destructive',
      });
    }
  });

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove ${member.first_name} ${member.last_name}?`)) {
      removeMemberMutation.mutate(member.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleRemove}>
          Remove Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
