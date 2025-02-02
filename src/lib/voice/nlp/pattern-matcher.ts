import { ErrorLogger } from '@/lib/errors/logger';

interface Pattern {
  regex: RegExp;
  extract: string[];
}

interface MatchResult {
  pattern: string;
  extracted: Record<string, string>;
  confidence: number;
}

export class PatternMatcher {
  private patterns: Record<string, Pattern> = {
    rateQuery: {
      regex: /(?:rate|price|cost)\s+(?:from\s+)?(?<origin>\w+)\s+to\s+(?<destination>\w+)(?:\s+(?<containerType>20|40|45)[^a-z]*)?/i,
      extract: ['origin', 'destination', 'containerType']
    },
    scheduleQuery: {
      regex: /(?:schedule|sailing|vessel)\s+(?:from\s+)?(?<origin>\w+)\s+to\s+(?<destination>\w+)(?:\s+(?:on|for)\s+(?<date>\d{4}-\d{2}-\d{2}))?/i,
      extract: ['origin', 'destination', 'date']
    },
    portStatus: {
      regex: /(?:status|condition|congestion)(?:\s+(?:of|at|for))?\s+(?:port\s+)?(?<port>\w+)/i,
      extract: ['port']
    },
    marketTrends: {
      regex: /(?:market|rate)\s+trends?(?:\s+(?:for|on)\s+(?<route>\w+))?/i,
      extract: ['route']
    }
  };

  findMatch(text: string): MatchResult | null {
    try {
      for (const [name, pattern] of Object.entries(this.patterns)) {
        const match = pattern.regex.exec(text);
        if (match) {
          const extracted: Record<string, string> = {};
          pattern.extract.forEach(key => {
            extracted[key] = match.groups?.[key] || '';
          });

          return {
            pattern: name,
            extracted,
            confidence: this.calculateConfidence(match[0], text)
          };
        }
      }
      return null;
    } catch (error) {
      ErrorLogger.error('Pattern matching failed', error as Error);
      return null;
    }
  }

  private calculateConfidence(match: string, text: string): number {
    // Calculate confidence based on match quality and coverage
    const coverage = match.length / text.length;
    const wordMatch = match.split(/\s+/).length / text.split(/\s+/).length;
    return (coverage + wordMatch) / 2;
  }
}