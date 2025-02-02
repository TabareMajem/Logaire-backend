import { ErrorLogger } from '@/lib/errors/logger';

interface SynthesisOptions {
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export class VoiceSynthesisService {
  async synthesize(text: string, options: SynthesisOptions = {}): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply options
        if (options.voice) {
          const voice = speechSynthesis.getVoices().find(v => v.name === options.voice);
          if (voice) utterance.voice = voice;
        }
        if (options.pitch) utterance.pitch = options.pitch;
        if (options.rate) utterance.rate = options.rate;
        if (options.volume) utterance.volume = options.volume;

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Synthesis failed: ${event.error}`));

        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      ErrorLogger.error('Voice synthesis failed', error as Error);
      throw error;
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  cancel(): void {
    speechSynthesis.cancel();
  }
}