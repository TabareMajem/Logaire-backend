// src/lib/ai/agents/rate/rate-agent.ts -->

import { ErrorLogger } from '@/lib/errors/logger';
import { MarketDataService } from '@/services/market-data-service';
import { RateService } from '@/services/rate-service';
import { EnhancedAgent, EnhancedAgentConfig } from '../base/enhanced-agent';

interface RateNegotiationConfig extends EnhancedAgentConfig {
  negotiation: {
    maxRounds: number;
    minAcceptableRate: number;
    maxAcceptableRate: number;
    targetMargin: number;
  };
  marketData: {
    considerHistoricalRates: boolean;
    marketVolatilityThreshold: number;
  };
}

interface NegotiationContext {
  origin: string;
  destination: string;
  containerType: string;
  volume: number;
  targetRate: number;
  currentRound: number;
  previousOffers: Array<{
    party: 'agent' | 'customer';
    rate: number;
    timestamp: string;
  }>;
}

export class RateAgent extends EnhancedAgent {
  private rateService: RateService;
  private marketDataService: MarketDataService;
  private config: RateNegotiationConfig;

  constructor(config: RateNegotiationConfig) {
    super(config);
    this.config = config;
    this.rateService = new RateService();
    this.marketDataService = new MarketDataService();
  }

  async negotiateRate(context: NegotiationContext): Promise<{
    proposedRate: number;
    explanation: string;
    confidence: number;
  }> {
    try {
      // Get market data
      const marketData = await this.marketDataService.getMarketData({
        origin: context.origin,
        destination: context.destination,
        containerType: context.containerType
      });

      // Generate negotiation prompt
      const prompt = await this.promptGenerator.generate('rate_negotiation', {
        context,
        marketData,
        config: this.config.negotiation
      });

      // Get AI recommendation
      const result = await this.processWithAI(
        { context, marketData },
        {
          currentMarketRate: marketData.currentRate,
          historicalAverage: marketData.historicalAverage,
          volatility: marketData.volatility
        },
        'rate_negotiation'
      );

      // Validate and adjust recommendation
      const adjustedRate = this.validateAndAdjustRate(
        result.proposedRate,
        context,
        marketData
      );

      return {
        proposedRate: adjustedRate,
        explanation: result.explanation,
        confidence: result.confidence
      };
    } catch (error) {
      ErrorLogger.error('Rate negotiation failed:', error as Error);
      throw error;
    }
  }

  private validateAndAdjustRate(
    proposedRate: number,
    context: NegotiationContext,
    marketData: any
  ): number {
    // Ensure rate is within acceptable range
    const minRate = Math.max(
      this.config.negotiation.minAcceptableRate,
      marketData.currentRate * 0.8
    );
    const maxRate = Math.min(
      this.config.negotiation.maxAcceptableRate,
      marketData.currentRate * 1.2
    );

    let adjustedRate = Math.max(minRate, Math.min(maxRate, proposedRate));

    // Consider market volatility
    if (marketData.volatility > this.config.marketData.marketVolatilityThreshold) {
      // Add risk premium in volatile markets
      adjustedRate *= 1 + (marketData.volatility * 0.1);
    }

    // Consider volume discounts
    if (context.volume > 100) {
      adjustedRate *= 0.95; // 5% volume discount
    }

    return Number(adjustedRate.toFixed(2));
  }

  async analyzeNegotiationHistory(context: NegotiationContext): Promise<{
    trend: 'converging' | 'diverging';
    recommendedStrategy: string;
  }> {
    if (context.previousOffers.length < 2) {
      return {
        trend: 'converging',
        recommendedStrategy: 'initial_offer'
      };
    }

    const rateChanges = context.previousOffers
      .slice(1)
      .map((offer, i) => {
        const prevOffer = context.previousOffers[i];
        return Math.abs(offer.rate - prevOffer.rate);
      });

    const isConverging = rateChanges.slice(1).every((change, i) => 
      change <= rateChanges[i]
    );

    return {
      trend: isConverging ? 'converging' : 'diverging',
      recommendedStrategy: this.determineStrategy(context, isConverging)
    };
  }

  private determineStrategy(
    context: NegotiationContext,
    isConverging: boolean
  ): string {
    if (context.currentRound >= this.config.negotiation.maxRounds - 1) {
      return 'final_offer';
    }

    if (!isConverging && context.currentRound > 2) {
      return 'reset_approach';
    }

    const lastOffer = context.previousOffers[context.previousOffers.length - 1];
    const targetDiff = Math.abs(lastOffer.rate - context.targetRate);

    if (targetDiff / context.targetRate < 0.05) {
      return 'close_deal';
    }

    return 'continue_negotiation';
  }
}