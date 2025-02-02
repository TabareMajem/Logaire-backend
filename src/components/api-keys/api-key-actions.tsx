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
} from '../../../components/ui/dropdown-menu';
import { MoreHorizontal, Copy, RefreshCw, Ban, Trash } from 'lucide-react';

interface APIKeyActionsProps {
  apiKey: {
    id: string;
    key: string;
    status: string;
  };
}

export function APIKeyActions({ apiKey }: APIKeyActionsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateAPIKeyStatus } = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ status })
        .eq('id', apiKey.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key status updated');
    },
    onError: () => {
      toast.error('Failed to update API key');
    }
  });

  const { mutate: deleteAPIKey } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', apiKey.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted');
    },
    onError: () => {
      toast.error('Failed to delete API key');
    }
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey.key)
      .then(() => toast.success('API key copied to clipboard'))
      .catch(() => toast.error('Failed to copy API key'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateAPIKeyStatus('active')}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Activate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateAPIKeyStatus('revoked')}>
          <Ban className="mr-2 h-4 w-4" />
          Revoke
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => deleteAPIKey()}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}