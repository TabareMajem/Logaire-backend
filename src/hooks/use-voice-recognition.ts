"use client";

import { useState, useCallback } from 'react';
import { VoiceRecognitionService } from '@/lib/voice/services/voice-recognition';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/lib/errors/logger';

export function useVoiceRecognition(options = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  const recognitionService = new VoiceRecognitionService();

  const startListening = useCallback(async () => {
    try {
      setIsListening(true);
      const result = await recognitionService.startRecognition(options);
      setTranscript(result);
    } catch (error) {
      ErrorLogger.error('Voice recognition failed', error as Error);
      toast.error('Failed to start voice recognition');
      setIsListening(false);
    }
  }, [options, toast]);

  const stopListening = useCallback(() => {
    recognitionService.stopRecognition();
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
}