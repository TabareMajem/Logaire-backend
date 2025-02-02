import { ErrorLogger } from '@/lib/errors/logger';

interface Intent {
  command: string;
  parameters: Record<string, any>;
  confidence: number;
}

export class IntentParser {
  private readonly commandPatterns: Record<string, RegExp> = {
    track: /track (?:shipment |order )?(\w+)/i,
    booking: /(?:check )?booking (?:status )?(\w+)/i, 
    document: /(?:check )?document (?:status )?(\w+)/i,
    shipments: /(?:list |show |get )?(?:my )?(?:active )?shipments/i,
    bookings: /(?:list |show |get )?(?:my )?(?:upcoming )?bookings/i,
    documents: /(?:list |show |get )?(?:my )?(?:recent )?documents/i,
    metrics: /(?:show |get )?(?:my )?metrics/i,
    report: /(?:show |get )?(?:performance )?report/i
  };

  parseIntent(transcript: string): Intent | null {
    try {
      for (const [command, pattern] of Object.entries(this.commandPatterns)) {
        const match = pattern.exec(transcript);
        if (match) {
          return {
            command,
            parameters: match.groups || {},
            confidence: this.calculateConfidence(match[0], transcript)
          };
        }
      }
      return null;
    } catch (error) {
      ErrorLogger.error('Intent parsing failed', error as Error);
      return null;
    }
  }

  private calculateConfidence(match: string, transcript: string): number {
    // Simple confidence calculation based on match length vs transcript length
    return match.length / transcript.length;
  }
}