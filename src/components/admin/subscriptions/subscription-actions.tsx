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
import { MoreHorizontal, Edit, RefreshCw, Ban, Archive } from 'lucide-react';
import { EditSubscriptionDialog } from './edit-subscription-dialog';

interface SubscriptionActionsProps {
  subscription: any;
}

export function SubscriptionActions({ subscription }: SubscriptionActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateSubscription } = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', subscription.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['subscriptions']});
      toast.success('Subscription updated');
    },
    onError: () => {
      toast.error('Failed to update subscription');
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
          <DropdownMenuItem onClick={() => updateSubscription('active')}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reactivate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateSubscription('past_due')}>
            <Ban className="mr-2 h-4 w-4" />
            Mark Past Due
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => updateSubscription('cancelled')}
          >
            <Archive className="mr-2 h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditSubscriptionDialog
        subscription={subscription}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
}