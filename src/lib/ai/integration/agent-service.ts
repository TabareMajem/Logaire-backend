import { RoutingAgent } from '../agents/routing/routing-agent';
import { RateAgent } from '../agents/rate/rate-agent';
import { RiskAgent } from '../agents/risk/risk-agent';
import { SchedulingAgent } from '../agents/scheduling/scheduling-agent';
import { AIAgentContext } from '../types';
import { ShipmentOptimization, DisruptionResponse } from '../types/integration';
import { ErrorLogger } from '@/lib/errors/logger';
import { CONFIDENCE_THRESHOLDS } from '../config';
import { Disruption, Route, Shipment } from '../types/shipment';
import { DisruptionUpdates, OptimizationRecommendations, ShipmentDetails } from '../types/optimization';
import { ShipmentAdapter } from './shipment-adapter';
import { Router } from 'lucide-react';

export class AIAgentService {
  private routingAgent: RoutingAgent;
  private rateAgent: RateAgent;
  private riskAgent: RiskAgent;
  private schedulingAgent: SchedulingAgent;

  constructor(context: AIAgentContext) {
    this.routingAgent = new RoutingAgent(context);
    this.rateAgent = new RateAgent(context);
    this.riskAgent = new RiskAgent(context);
    this.schedulingAgent = new SchedulingAgent(context);
  }

  async optimizeShipment(
    shipmentDetails: ShipmentDetails
  ): Promise<ShipmentOptimization> {
    try {
      const shipment = ShipmentAdapter.toShipment(shipmentDetails);
      
      const rateRequest = {
        origin: shipmentDetails.origin,
        destination: shipmentDetails.destination,
        cargoDetails: shipmentDetails.cargoDetails,
        constraints: shipmentDetails.rateConstraints
      };
  
      const [routeRec, rateRec, riskAssessment, scheduleRec] = await Promise.all([
        this.routingAgent.optimizeRoute(
          shipmentDetails.origin,
          shipmentDetails.destination,
          shipmentDetails.constraints
        ),
        this.rateAgent.optimizeRates(rateRequest),
        this.riskAgent.assessShipmentRisk(shipmentDetails),
        this.schedulingAgent.optimizeSchedule(
          shipment,  // Now passing the converted Shipment object
          shipmentDetails.scheduleConstraints
        )
      ]);

      // Rest of the method remains the same
      return this.combineRecommendations({
        route: routeRec,
        rate: rateRec,
        risk: riskAssessment,
        schedule: scheduleRec
      });
    } catch (error) {
      ErrorLogger.error('Shipment optimization failed', error as Error);
      throw error;
    }
  }

  // async handleDisruption(
  //   shipment: Shipment,
  //   disruption: Disruption
  // ): Promise<DisruptionResponse> {
  //   try {
  //     const [routeUpdate, rateImpact, riskUpdate, scheduleRecovery] = await Promise.all([
  //       this.routingAgent.suggestAlternatives(shipment.route, disruption),
  //       this.rateAgent.predictRateTrends({
  //         origin: shipment.route.origin,
  //         destination: shipment.route.destination,  // assuming this is the destination property
  //         timeframe: 7
  //       }),
  //       this.riskAgent.assessShipmentRisk(shipment),
  //       this.schedulingAgent.handleScheduleDisruption(shipment, disruption)
  //     ]);

  //     return this.createDisruptionResponse({
  //       routeUpdate,
  //       rateImpact,
  //       riskUpdate,
  //       scheduleRecovery
  //     });
  //   } catch (error) {
  //     ErrorLogger.error('Disruption handling failed', error as Error);
  //     throw error;
  //   }
  // }

  private combineRecommendations(
    recs: OptimizationRecommendations
  ): ShipmentOptimization {
    const confidence = this.calculateOverallConfidence([
      recs.route.confidence,
      recs.rate.data,
      recs.risk.confidence,
      recs.schedule.confidence
    ]);

    const warnings = this.identifyWarnings(recs);
    const recommendations = this.generateRecommendations(recs);

    return {
      route: recs.route,
      rates: recs.rate.data,
      risks: recs.risk,
      schedule: recs.schedule.data,
      summary: {
        confidence,
        recommendations,
        warnings
      }
    };
  }

  private calculateOverallConfidence(confidences: number[]): number {
    // Weight confidences based on importance
    const weights = {
      route: 0.3,
      rate: 0.2,
      risk: 0.3,
      schedule: 0.2
    };

    return confidences.reduce((acc, conf, i) => 
      acc + conf * Object.values(weights)[i], 0
    );
  }

  private identifyWarnings(recs: OptimizationRecommendations): string[] {
    const warnings: string[] = [];

    // Check confidence thresholds
    if (recs.route.confidence < CONFIDENCE_THRESHOLDS.MEDIUM) {
      warnings.push('Low confidence in route optimization');
    }
    if (recs.risk.data.overallRisk === 'high') {
      warnings.push('High risk assessment detected');
    }
    // Add more warning checks

    return warnings;
  }

  private generateRecommendations(recs: OptimizationRecommendations): string[] {
    const recommendations: string[] = [];

    // Combine and prioritize recommendations
    if (recs.risk.data.recommendations) {
      recommendations.push(...recs.risk.data.recommendations);
    }
    if (recs.rate.data.reasoning) {
      recommendations.push(...recs.rate.data.reasoning);
    }
    // Add more recommendation sources

    return recommendations;
  }

  private createDisruptionResponse(
    updates: DisruptionUpdates
  ): DisruptionResponse {
    // Implementation
    return {
      impact: {
        severity: 'medium',
        affectedAreas: []
      },
      recommendations: [],
      alternatives: []
    };
  }
}