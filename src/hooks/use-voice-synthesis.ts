"use client";

import { useState, useCallback } from 'react';
import { VoiceSynthesisService } from '@/lib/voice/services/voice-synthesis';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';

export function useVoiceSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const synthesisService = new VoiceSynthesisService();

  const speak = useCallback(async (text: string, options = {}) => {
    try {
      setIsSpeaking(true);
      await synthesisService.synthesize(text, options);
    } catch (error) {
      ErrorLogger.error('Voice synthesis failed', error as Error);
      toast.error('Failed to synthesize speech');
    } finally {
      setIsSpeaking(false);
    }
  }, [toast]);

  const stop = useCallback(() => {
    synthesisService.cancel();
    setIsSpeaking(false);
  }, []);

  const getVoices = useCallback(() => {
    return synthesisService.getAvailableVoices();
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    getVoices
  };
}