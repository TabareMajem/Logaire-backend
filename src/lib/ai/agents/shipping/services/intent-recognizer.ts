import { ErrorLogger } from '@/lib/errors/logger';

interface IntentPattern {
  intent: string;
  patterns: RegExp[];
  keywords: string[];
}

export class IntentRecognizer {
  private readonly intentPatterns: IntentPattern[] = [
    {
      intent: 'get_quote',
      patterns: [
        /how much.*ship/i,
        /shipping.*cost/i,
        /price.*deliver/i,
        /quote.*package/i
      ],
      keywords: ['quote', 'cost', 'price', 'rate', 'charge', 'fee']
    },
    {
      intent: 'track_shipment',
      patterns: [
        /track.*package/i,
        /where.*shipment/i,
        /delivery.*status/i,
        /package.*location/i
      ],
      keywords: ['track', 'status', 'location', 'where', 'tracking']
    },
    {
      intent: 'request_info',
      patterns: [
        /how.*ship/i,
        /shipping.*options/i,
        /what.*services/i,
        /information.*about/i
      ],
      keywords: ['how', 'info', 'information', 'help', 'guide', 'explain']
    },
    {
      intent: 'schedule_pickup',
      patterns: [
        /schedule.*pickup/i,
        /collect.*package/i,
        /arrange.*collection/i
      ],
      keywords: ['pickup', 'collect', 'schedule', 'arrange', 'pick up']
    }
  ];

  private readonly fallbackIntent = 'general_inquiry';
  private readonly confidenceThresholds = {
    pattern: 0.8,
    keyword: 0.6,
    combined: 0.7
  };

  async recognize(input: string): Promise<string> {
    try {
      const normalizedInput = this.normalizeInput(input);
      let bestMatch = {
        intent: this.fallbackIntent,
        confidence: 0
      };

      for (const pattern of this.intentPatterns) {
        const confidence = this.calculateConfidence(normalizedInput, pattern);
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent: pattern.intent,
            confidence: confidence
          };
        }
      }

      // Log high uncertainty cases for analysis
      if (bestMatch.confidence < this.confidenceThresholds.combined) {
        ErrorLogger.warn('Low confidence intent recognition:', {
          input: normalizedInput,
          detectedIntent: bestMatch.intent,
          confidence: bestMatch.confidence
        });
      }

      return bestMatch.intent;

    } catch (error) {
      ErrorLogger.error('Error recognizing intent:', error as Error);
      return this.fallbackIntent;
    }
  }

  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateConfidence(input: string, pattern: IntentPattern): number {
    const patternScore = this.calculatePatternScore(input, pattern.patterns);
    const keywordScore = this.calculateKeywordScore(input, pattern.keywords);
    
    // Weighted average of pattern and keyword scores
    return (
      patternScore * this.confidenceThresholds.pattern +
      keywordScore * this.confidenceThresholds.keyword
    ) / (this.confidenceThresholds.pattern + this.confidenceThresholds.keyword);
  }

  private calculatePatternScore(input: string, patterns: RegExp[]): number {
    const matches = patterns.filter(pattern => pattern.test(input));
    return matches.length / patterns.length;
  }

  private calculateKeywordScore(input: string, keywords: string[]): number {
    const words = input.split(' ');
    const matches = keywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    );
    return matches.length / keywords.length;
  }
} 