import { ErrorLogger } from '@/lib/errors/logger';

export interface Voice {
  id: string;
  name: string;
  settings: VoiceSettings;
}

export interface VoiceSettings {
  stability: number;
  similarity: number;
  style?: number;
  useDiarization?: boolean;
}

export interface AudioFile {
  data: ArrayBuffer;
  mimeType: string;
}

export class ElevenLabsService {
  private readonly API_KEY = process.env.ELEVENLABS_API_KEY;
  private readonly API_URL = 'https://api.elevenlabs.io/v1';

  async generateSpeech(text: string, voiceId: string): Promise<ReadableStream> {
    try {
      const response = await fetch(`${this.API_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return response.body!;
    } catch (error) {
      ErrorLogger.error('Speech generation failed', error as Error);
      throw error;
    }
  }

  async streamSpeech(text: string, voiceId: string): Promise<ReadableStream> {
    try {
      const chunks = this.splitTextIntoChunks(text);
      const streams = await Promise.all(
        chunks.map(chunk => this.generateSpeech(chunk, voiceId))
      );
      return this.combineAudioStreams(streams);
    } catch (error) {
      ErrorLogger.error('Speech streaming failed', error as Error);
      throw error;
    }
  }

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.API_URL}/voices`, {
        headers: {
          'xi-api-key': this.API_KEY!
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      ErrorLogger.error('Failed to get voices', error as Error);
      throw error;
    }
  }

  async createVoice(name: string, samples: AudioFile[]): Promise<Voice> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      
      samples.forEach((sample, index) => {
        const blob = new Blob([sample.data], { type: sample.mimeType });
        formData.append(`sample_${index}`, blob);
      });

      const response = await fetch(`${this.API_URL}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.API_KEY!
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to create voice: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      ErrorLogger.error('Voice creation failed', error as Error);
      throw error;
    }
  }

  async adjustVoiceSettings(voiceId: string, settings: VoiceSettings): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/voices/${voiceId}/settings`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`Failed to adjust voice settings: ${response.status}`);
      }
    } catch (error) {
      ErrorLogger.error('Voice settings adjustment failed', error as Error);
      throw error;
    }
  }

  private splitTextIntoChunks(text: string, maxChunkLength: number = 1000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    text.split(/([.!?]+)/).forEach(segment => {
      if (currentChunk.length + segment.length <= maxChunkLength) {
        currentChunk += segment;
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = segment;
      }
    });

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private async combineAudioStreams(streams: ReadableStream[]): Promise<ReadableStream> {
    const chunks: Uint8Array[] = [];

    for (const stream of streams) {
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    }

    return new ReadableStream({
      start(controller) {
        chunks.forEach(chunk => controller.enqueue(chunk));
        controller.close();
      }
    });
  }
}