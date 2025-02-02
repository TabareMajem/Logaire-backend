"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContentDialog, ContentFormData } from './content-dialog';

interface EditContentDialogProps {
  content: any; // Replace with proper content type
  open: boolean;
  onClose: () => void;
}

export function EditContentDialog({ content, open, onClose }: EditContentDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: editContent, isPending } = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const { error } = await supabase
        .from('content')
        .update(data)
        .eq('id', content.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update content');
    }
  });

  return (
    <ContentDialog
      open={open}
      onClose={onClose}
      onSubmit={editContent}
      initialData={content}
      title="Edit Content"
      submitLabel="Save Changes"
      isLoading={isPending}
    />
  );
}