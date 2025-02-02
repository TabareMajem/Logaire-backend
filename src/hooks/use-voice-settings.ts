"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';

interface VoiceSettings {
  voiceId: string;
  language: string;
  speed: number;
  pitch: number;
}

export function useVoiceSettings() {
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: voices = [] } = useQuery({
    queryKey: ['voice-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['voice-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_profiles')
        .select('settings')
        .single();

      if (error) throw error;
      return data?.settings as VoiceSettings;
    }
  });


  const { mutate: updateSettings } = useMutation({
    mutationFn: async (newSettings: VoiceSettings) => {
      const { data: user, error: userError } = await supabase.auth.getUser();
  
      if (userError) throw userError;
  
      const { error } = await supabase
        .from('voice_profiles')
        .update({ settings: newSettings })
        .eq('user_id', user?.user.id); // Using user?.id instead of supabase.auth.user()?.id
  
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-settings'] });
      toast.success('Voice settings updated');
    },
    onError: (error) => {
      ErrorLogger.error('Failed to update voice settings', error as Error);
      toast.error('Failed to update voice settings');
    }
  });

  return {
    voices,
    settings,
    updateSettings
  };
}