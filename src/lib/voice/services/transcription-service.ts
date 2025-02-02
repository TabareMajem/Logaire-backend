done done done

import { ErrorLogger } from '@/lib/errors/logger';

export class TranscriptionService {
  async transcribeAudio(audioStream: ReadableStream): Promise<string> {
    try {
      // Convert stream to audio buffer
      const audioBuffer = await this.streamToBuffer(audioStream);
      
      // Process audio using WebSpeech API
      const transcript = await this.processAudio(audioBuffer);
      
      return transcript;
    } catch (error) {
      ErrorLogger.error('Audio transcription failed', error as Error);
      throw error;
    }
  }

  private async streamToBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    return new Blob(chunks).arrayBuffer();
  }

  private async processAudio(audioBuffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
    });
  }
}