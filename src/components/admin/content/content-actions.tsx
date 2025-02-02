// src/components/admin/content/content-action.tsx -->

"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Archive, Trash } from 'lucide-react';
import { EditContentDialog } from './edit-content-dialog';

interface ContentActionsProps {
  content: any;
}

export function ContentActions({ content }: ContentActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateContent } = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('content')
        .update({ status })
        .eq('id', content.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content updated');
    },
    onError: () => {
      toast.error('Failed to update content');
    }
  });

  const { mutate: deleteContent } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', content.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['content']});
      toast.success('Content deleted');
    },
    onError: () => {
      toast.error('Failed to delete content');
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
          <DropdownMenuItem onClick={() => updateContent('published')}>
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateContent('archived')}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => deleteContent()}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditContentDialog
        content={content}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
}