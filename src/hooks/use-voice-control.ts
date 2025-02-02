"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CommunicationHub } from '@/lib/voice/communication-hub';
import { ErrorLogger } from '@/lib/errors/logger';

export function useVoiceControl() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const hub = new CommunicationHub();

  const startListening = useCallback(async () => {
    try {
      setIsListening(true);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start voice processing
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        try {
          const audioBlob = new Blob(audioChunks);
          const audioStream = audioBlob.stream();
          
          // Process voice command
          await hub.handleVoiceCall({
            id: crypto.randomUUID(),
            audioStream,
            respond: async (response) => {
              try {
                // Create a new AudioContext
                const audioContext = new AudioContext();
      
                // Read the ReadableStream into an ArrayBuffer
                const arrayBuffer = await streamToArrayBuffer(response);
      
                // Decode the audio data into an AudioBuffer
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                // Create a buffer source node and play the audio
                const audioSource = audioContext.createBufferSource();
                audioSource.buffer = audioBuffer;
                audioSource.connect(audioContext.destination);
                
                // Start playback
                audioSource.start();
              } catch (error) {
                ErrorLogger.error('Error decoding and playing audio', error as Error);
              }
            }
          });


        } catch (error) {
          ErrorLogger.error('Voice processing failed', error as Error);
          toast.error('Failed to process voice command');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
    } catch (error) {
      ErrorLogger.error('Failed to start voice recording', error as Error);
      toast.error('Failed to access microphone');
      setIsListening(false);
    }
  }, [toast]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  async function streamToArrayBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    
    // Read the chunks of the stream
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      if (value) {
        chunks.push(value);
      }
      done = doneReading;
    }
  
    // Combine all chunks into one ArrayBuffer
    const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Uint8Array(arrayBuffer);
    let offset = 0;
  
    // Copy the chunks into the ArrayBuffer
    for (const chunk of chunks) {
      view.set(chunk, offset);
      offset += chunk.length;
    }
  
    return arrayBuffer;
  }

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening
  };
}