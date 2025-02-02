// src/components/admin/integrations/integration-actions.tsx -->

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
import { MoreHorizontal, Edit, RefreshCw, Power, Trash } from 'lucide-react';
import { EditIntegrationDialog } from './edit-integration-dialog';

interface IntegrationActionsProps {
  integration: any;
}

export function IntegrationActions({ integration }: IntegrationActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateIntegration } = useMutation({
    mutationFn: async (updates: Partial<typeof integration>) => {
      const { error } = await supabase
        .from('carrier_integrations')
        .update(updates)
        .eq('id', integration.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['integrations']});
      toast.success('Integration updated');
    },
    onError: () => {
      toast.error('Failed to update integration');
    }
  });

  const { mutate: syncIntegration } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .rpc('sync_integration', { integration_id: integration.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['integrations']});
      toast.success('Integration synced successfully');
    },
    onError: () => {
      toast.error('Failed to sync integration');
    }
  });

  const { mutate: deleteIntegration } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('carrier_integrations')
        .delete()
        .eq('id', integration.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['integrations']});
      toast.success('Integration deleted');
    },
    onError: () => {
      toast.error('Failed to delete integration');
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
          <DropdownMenuItem onClick={() => syncIntegration()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Now
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updateIntegration({ active: !integration.active })}
          >
            <Power className="mr-2 h-4 w-4" />
            {integration.active ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => deleteIntegration()}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditIntegrationDialog
        integration={integration}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
}
