done done done

import { ErrorLogger } from '@/lib/errors/logger';

interface RecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;

  startRecognition(options: RecognitionOptions = {}): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        
        // Apply options
        this.recognition.lang = options.language || 'en-US';
        this.recognition.continuous = options.continuous || false;
        this.recognition.interimResults = options.interimResults || false;

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        this.recognition.onerror = (event) => {
          reject(new Error(`Recognition failed: ${event.error}`));
        };

        this.recognition.start();
      });
    } catch (error) {
      ErrorLogger.error('Voice recognition failed', error as Error);
      throw error;
    }
  }

  stopRecognition(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }
}