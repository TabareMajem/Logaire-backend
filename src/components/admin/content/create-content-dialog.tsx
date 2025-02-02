"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContentDialog } from './content-dialog';
import type { ContentFormData } from './content-dialog'; // Make sure to export this type from content-dialog.tsx

interface CreateContentDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateContentDialog({ open, onClose }: CreateContentDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: createContent, isPending } = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const { error } = await supabase
        .from('content')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create content');
    }
  });

  return (
    <ContentDialog
      open={open}
      onClose={onClose}
      onSubmit={createContent}
      title="Create Content"
      submitLabel="Create"
      isLoading={isPending}
    />
  );
}