import { BaseAgent } from '../../core/base-agent';
import { AIContext, AIResponse } from '../../core/types';
import { ErrorLogger } from '@/lib/errors/logger';

interface CargoDetails {
  type: string;
  weight: number;
  volume?: number;
  hazardous: boolean;
  temperature?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
}

interface CargoAnalysis {
  classification: string;
  requirements: string[];
  restrictions: string[];
  handlingInstructions: string[];
  estimatedCosts: {
    handling: number;
    storage: number;
    specialEquipment?: number;
  };
}

export class CargoAnalysisAgent extends BaseAgent {
  constructor(context: AIContext) {
    super(context, {
      name: 'cargo-analysis',
      rules: [
        {
          id: 'validate-cargo-details',
          type: 'validation',
          condition: (data) => !!data.type && !!data.weight,
          action: async (data) => {
            if (data.hazardous && !data.handlingInstructions) {
              throw new Error('Handling instructions required for hazardous cargo');
            }
            return data;
          }
        },
        {
          id: 'classify-cargo',
          type: 'transformation',
          condition: () => true,
          action: async (data) => {
            return {
              ...data,
              classification: this.classifyCargo(data)
            };
          }
        },
        {
          id: 'calculate-requirements',
          type: 'enrichment',
          condition: () => true,
          action: async (data) => {
            return {
              ...data,
              requirements: this.calculateRequirements(data)
            };
          }
        }
      ]
    });
  }

  async analyzeCargo(cargo: CargoDetails): Promise<AIResponse<CargoAnalysis>> {
    try {
      return await this.process<CargoAnalysis>(cargo);
    } catch (error) {
      ErrorLogger.error('Cargo analysis failed', error as Error);
      throw error;
    }
  }

  private classifyCargo(cargo: CargoDetails): string {
    // Implement cargo classification logic
    if (cargo.hazardous) return 'HAZMAT';
    if (cargo.temperature) return 'TEMPERATURE_CONTROLLED';
    return 'GENERAL_CARGO';
  }

  private calculateRequirements(cargo: CargoDetails): string[] {
    const requirements: string[] = [];
    
    if (cargo.hazardous) {
      requirements.push('HAZMAT_CERTIFICATION');
      requirements.push('SPECIAL_HANDLING');
    }

    if (cargo.temperature) {
      requirements.push('TEMPERATURE_MONITORING');
      requirements.push('REEFER_CONTAINER');
    }

    return requirements;
  }

  protected calculateConfidence(data: CargoAnalysis): number {
    // Implement confidence calculation based on data completeness
    let confidence = 0.7;
    
    if (data.requirements.length > 0) confidence += 0.1;
    if (data.handlingInstructions.length > 0) confidence += 0.1;
    if (data.estimatedCosts.specialEquipment) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  protected generateReasoning(data: CargoAnalysis): string[] {
    return [
      `Cargo classified as: ${data.classification}`,
      `Required certifications: ${data.requirements.join(', ')}`,
      `Special handling: ${data.handlingInstructions.length > 0 ? 'Yes' : 'No'}`
    ];
  }
}