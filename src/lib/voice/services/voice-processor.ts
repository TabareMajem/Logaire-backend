import { CommandRegistry } from '../commands/command-registry';
import { TranscriptionService } from './transcription-service';
import { ErrorLogger } from '@/lib/errors/logger';

interface ProcessedCommand {
  command: string;
  parameters: Record<string, any>;
}

export class VoiceProcessor {
  private transcriptionService: TranscriptionService;
  private commandRegistry: CommandRegistry;

  constructor() {
    this.transcriptionService = new TranscriptionService();
    this.commandRegistry = new CommandRegistry();
  }

  async processVoiceCommand(audioStream: ReadableStream): Promise<string> {
    try {
      // Transcribe audio to text
      const transcript = await this.transcriptionService.transcribeAudio(audioStream);
      
      // Parse command and parameters
      const { command, parameters } = this.parseCommand(transcript);
      
      // Execute command
      return await this.commandRegistry.executeCommand(command, parameters);
    } catch (error) {
      ErrorLogger.error('Voice command processing failed', error as Error);
      throw error;
    }
  }

  private parseCommand(transcript: string): ProcessedCommand {
    // Implement NLP to extract command and parameters
    // This is a simplified example
    const words = transcript.toLowerCase().split(' ');
    const command = words[0];
    const parameters: Record<string, any> = {};

    // Extract parameters based on command type
    if (command === 'track' && words.length > 1) {
      parameters.reference = words[1];
    }

    return { command, parameters };
  }
}