import { ErrorLogger } from '@/lib/errors/logger';
import { ShippingDetails } from '../types';

interface HandoffConfig {
  thresholds: {
    lowConfidence: number;
    highComplexity: number;
    customerFrustration: number;
  };
  escalationTriggers: string[];
}

interface HandoffContext {
  intent: string;
  confidenceLevel: number;
  extractedInfo: ShippingDetails;
  previousInteractions: string[];
}

export class HumanHandoffManager {
  private readonly frustrationKeywords = [
    'frustrated',
    'angry',
    'upset',
    'annoyed',
    'wrong',
    'mistake',
    'not working',
    'doesn\'t work',
    'help',
    'human',
    'agent',
    'person',
    'speak',
    'talk'
  ];

  private readonly complexityIndicators = [
    'customs',
    'international',
    'dangerous',
    'hazardous',
    'restricted',
    'insurance',
    'claim',
    'damaged',
    'lost',
    'refund',
    'compensation'
  ];

  constructor(private readonly config: HandoffConfig) {}

  shouldHandoff(context: HandoffContext): boolean {
    try {
      // Check confidence threshold
      if (context.confidenceLevel < this.config.thresholds.lowConfidence) {
        ErrorLogger.info('Handoff triggered: Low confidence', {
          confidence: context.confidenceLevel,
          threshold: this.config.thresholds.lowConfidence
        });
        return true;
      }

      // Check for explicit escalation triggers
      if (this.hasEscalationTriggers(context.previousInteractions)) {
        ErrorLogger.info('Handoff triggered: Escalation keywords detected');
        return true;
      }

      // Check customer frustration level
      const frustrationLevel = this.calculateFrustrationLevel(context.previousInteractions);
      if (frustrationLevel > this.config.thresholds.customerFrustration) {
        ErrorLogger.info('Handoff triggered: High customer frustration', {
          level: frustrationLevel,
          threshold: this.config.thresholds.customerFrustration
        });
        return true;
      }

      // Check request complexity
      const complexityScore = this.calculateComplexityScore(context);
      if (complexityScore > this.config.thresholds.highComplexity) {
        ErrorLogger.info('Handoff triggered: High complexity request', {
          score: complexityScore,
          threshold: this.config.thresholds.highComplexity
        });
        return true;
      }

      // Check for repeated misunderstandings
      if (this.hasRepeatedMisunderstandings(context.previousInteractions)) {
        ErrorLogger.info('Handoff triggered: Repeated misunderstandings detected');
        return true;
      }

      return false;

    } catch (error) {
      ErrorLogger.error('Error in handoff decision:', error as Error);
      return true; // Fail safe: escalate to human if error occurs
    }
  }

  private hasEscalationTriggers(interactions: string[]): boolean {
    const lastMessage = interactions[interactions.length - 1]?.toLowerCase() || '';
    return this.config.escalationTriggers.some(trigger =>
      lastMessage.includes(trigger.toLowerCase())
    );
  }

  private calculateFrustrationLevel(interactions: string[]): number {
    if (interactions.length === 0) return 0;

    const recentInteractions = interactions.slice(-3); // Look at last 3 interactions
    let frustrationScore = 0;

    recentInteractions.forEach((interaction, index) => {
      const recency = (index + 1) / recentInteractions.length; // More weight to recent messages
      const matches = this.frustrationKeywords.filter(keyword =>
        interaction.toLowerCase().includes(keyword)
      ).length;
      frustrationScore += matches * recency;
    });

    return frustrationScore / recentInteractions.length;
  }

  private calculateComplexityScore(context: HandoffContext): number {
    let score = 0;

    // Check for complex topics in the conversation
    const complexTopics = this.complexityIndicators.filter(indicator =>
      context.previousInteractions.some(msg =>
        msg.toLowerCase().includes(indicator)
      )
    ).length;
    score += complexTopics * 0.3;

    // Add complexity for international shipping
    if (this.isInternationalShipping(context.extractedInfo)) {
      score += 0.4;
    }

    // Add complexity for special handling requirements
    if (context.extractedInfo.specialHandling?.length) {
      score += context.extractedInfo.specialHandling.length * 0.2;
    }

    return score;
  }

  private isInternationalShipping(info: ShippingDetails): boolean {
    // Simple check for different countries/regions
    // In a real implementation, this would use a proper geography service
    const originCountry = this.extractCountry(info.origin || '');
    const destCountry = this.extractCountry(info.destination || '');
    return originCountry !== destCountry;
  }

  private extractCountry(location: string): string {
    // Simplified country extraction - in real implementation would use a geography service
    return location.split(',').pop()?.trim().toLowerCase() || '';
  }

  private hasRepeatedMisunderstandings(interactions: string[]): boolean {
    if (interactions.length < 4) return false;

    const recentInteractions = interactions.slice(-4);
    const clarificationPatterns = [
      /(?:no|not|wrong|incorrect)/i,
      /i (?:mean|meant|said)/i,
      /you (?:don't|didn't) understand/i
    ];

    let clarificationCount = 0;
    recentInteractions.forEach(interaction => {
      if (clarificationPatterns.some(pattern => pattern.test(interaction))) {
        clarificationCount++;
      }
    });

    return clarificationCount >= 2; // Two or more clarifications in recent messages
  }
} 