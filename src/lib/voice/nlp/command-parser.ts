import { IntentParser } from './intent-parser';
import { ErrorLogger } from '@/lib/errors/logger';

interface ParsedCommand {
  command: string;
  parameters: Record<string, any>;
  confidence: number;
}

export class CommandParser {
  private intentParser: IntentParser;

  constructor() {
    this.intentParser = new IntentParser();
  }

  async parseCommand(transcript: string): Promise<ParsedCommand | null> {
    try {
      // Parse intent from transcript
      const intent = this.intentParser.parseIntent(transcript);
      if (!intent) return null;

      // Validate and normalize parameters
      const parameters = await this.validateParameters(intent.parameters);

      return {
        command: intent.command,
        parameters,
        confidence: intent.confidence
      };
    } catch (error) {
      ErrorLogger.error('Command parsing failed', error as Error);
      return null;
    }
  }

  private async validateParameters(params: Record<string, any>): Promise<Record<string, any>> {
    // Add parameter validation logic here
    return params;
  }
}