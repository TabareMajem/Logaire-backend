import { EnhancedBaseAgent } from '../base/enhanced-agent';
import { AgentCapability, AgentTask } from '../base/types';
import { RiskRequest, RiskResponse } from './types';
import { ErrorLogger } from '@/lib/errors/logger';
import { Shipment } from '../../types/shipment';
import { ShipmentDetails } from '../../types/optimization';

export class RiskAgent extends EnhancedBaseAgent {
  protected defineCapabilities(): AgentCapability[] {
    return [
      {
        name: 'risk_assessment',
        description: 'Assess shipping route risks',
        requiredData: ['route', 'cargoDetails'],
        confidenceThreshold: 0.9
      },
      {
        name: 'risk_mitigation',
        description: 'Generate risk mitigation strategies',
        requiredData: ['risks', 'constraints'],
        confidenceThreshold: 0.85
      }
    ];
  }

  async assessShipmentRisk(input: ShipmentDetails | Shipment): Promise<RiskResponse> {
    try {
      // Convert input to RiskRequest format
      const riskRequest = this.createRiskRequest(input);
      
      // Assess risks using existing method
      const riskAssessment = await this.assessRisks(riskRequest);

      // Generate mitigation strategies
      const fullRiskResponse = await this.generateMitigationStrategies(riskAssessment);

      return fullRiskResponse;
    } catch (error) {
      ErrorLogger.error('Shipment risk assessment failed', error as Error);
      throw error;
    }
  }

  private createRiskRequest(input: ShipmentDetails | Shipment): RiskRequest {
    // Handle both ShipmentDetails and Shipment types
    const isShipment = 'route' in input;
    
    return {
      route: isShipment ? (input as Shipment).route : {
        id: '',  // You might want to generate this
        origin: {
          name: input.origin,
          coordinates: [0, 0], // You'll need to get these from somewhere
          type: 'other',
          code: input.origin
        },
        destination: {
          name: input.destination,
          coordinates: [0, 0], // You'll need to get these from somewhere
          type: 'other',
          code: input.destination
        },
        via: [],
        estimatedDuration: 0,
        estimatedCost: 0,
        distance: 0,
        carbonEmissions: 0,
        risks: []
      },
      cargoDetails: {
        type: input.cargoDetails.type,
        value: 0, // You might want to calculate this based on available data
        hazardous: input.cargoDetails.type.toLowerCase().includes('hazardous')
      },
      constraints: {
        maxRiskLevel: 'medium',
        requiredInsurance: true,
        specialHandling: []
      }
    };
  }

  async assessRisks(request: RiskRequest): Promise<RiskResponse> {
    try {
      const task: AgentTask = {
        type: 'risk_assessment',
        input: request,
        requirements: {
          minConfidence: 0.9,
          maxLatency: 2000,
          priority: 'high'
        }
      };

      const response = await this.executeTask<RiskResponse>(task);
      return response.data;
    } catch (error) {
      ErrorLogger.error('Risk assessment failed', error as Error);
      throw error;
    }
  }

  async generateMitigationStrategies(risks: RiskResponse): Promise<RiskResponse> {
    try {
      const task: AgentTask = {
        type: 'risk_mitigation',
        input: { risks },
        requirements: {
          minConfidence: 0.85,
          priority: 'high'
        }
      };

      const response = await this.executeTask<RiskResponse>(task);
      return response.data;
    } catch (error) {
      ErrorLogger.error('Risk mitigation generation failed', error as Error);
      throw error;
    }
  }
}