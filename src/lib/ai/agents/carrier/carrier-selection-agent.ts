import { BaseAgent } from '../../core/base-agent';
import { AIContext, AIResponse } from '../../core/types';
import { ErrorLogger } from '@/lib/errors/logger';
import { CarrierRequest, CarrierRecommendation } from './types';

export class CarrierSelectionAgent extends BaseAgent {
  constructor(context: AIContext) {
    super(context, {
      name: 'carrier-selection',
      rules: [
        {
          id: 'validate-carrier-request',
          type: 'validation',
          condition: (data) => !!data.route && !!data.requirements,
          action: async (data) => {
            if (!data.requirements.capacity || data.requirements.capacity <= 0) {
              throw new Error('Invalid capacity requirement');
            }
            return data;
          }
        },
        {
          id: 'analyze-performance',
          type: 'enrichment',
          condition: () => true,
          action: async (data) => {
            return {
              ...data,
              performance: await this.analyzeCarrierPerformance(data)
            };
          }
        },
        {
          id: 'rank-carriers',
          type: 'transformation',
          condition: () => true,
          action: async (data) => {
            return {
              ...data,
              rankings: await this.rankCarriers(data)
            };
          }
        }
      ]
    });
  }

  async selectCarrier(request: CarrierRequest): Promise<AIResponse<CarrierRecommendation>> {
    try {
      return await this.process<CarrierRecommendation>(request);
    } catch (error) {
      ErrorLogger.error('Carrier selection failed', error as Error);
      throw error;
    }
  }

  private async analyzeCarrierPerformance(data: any): Promise<any> {
    // Implement carrier performance analysis
    return {};
  }

  private async rankCarriers(data: any): Promise<any> {
    // Implement carrier ranking logic
    return {};
  }

  protected calculateConfidence(data: CarrierRecommendation): number {
    let confidence = 0.7;
    
    if (data.alternatives.length > 0) confidence += 0.1;
    if (data.performance.reliability > 0.9) confidence += 0.1;
    if (data.constraints.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  protected generateReasoning(data: CarrierRecommendation): string[] {
    return [
      `Selected carrier: ${data.carrier}`,
      `Performance score: ${(data.performance.reliability * 100).toFixed(1)}%`,
      `Alternative options: ${data.alternatives.length}`
    ];
  }
}