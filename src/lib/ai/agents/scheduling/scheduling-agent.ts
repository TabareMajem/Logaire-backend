// src/lib/ai/agents/scheduling/scheduling-agent.ts -->

import { BaseAgent } from '../../base-agent';
import { AIAgentContext, AIAgentResponse } from '../../types';
import { ErrorLogger } from '@/lib/errors/logger';
import { PortScheduleService } from './port-schedule-service';
import { CarrierScheduleService } from './carrier-schedule-service';
import { BufferCalculator } from './buffer-calculator';
import { DisruptionHandler } from './disruption-handler';
import { RecoveryPlanGenerator } from './recovery-plan-generator';
import { ScheduleValidator } from './schedule-validator';
import {
  ScheduleOptimization,
  ScheduleConstraints,
  scheduleOptimizationSchema
} from '../../types/scheduling';
import { Shipment, Disruption } from '../../types/shipment';

export class SchedulingAgent extends BaseAgent {
  private portSchedules: PortScheduleService;
  private carrierSchedules: CarrierScheduleService;
  private bufferCalculator: BufferCalculator;
  private disruptionHandler: DisruptionHandler;
  private recoveryPlanner: RecoveryPlanGenerator;
  private validator: ScheduleValidator;

  constructor(context: AIAgentContext) {
    super(context);
    this.portSchedules = new PortScheduleService();
    this.carrierSchedules = new CarrierScheduleService();
    this.bufferCalculator = new BufferCalculator();
    this.disruptionHandler = new DisruptionHandler();
    this.recoveryPlanner = new RecoveryPlanGenerator();
    this.validator = new ScheduleValidator();
  }

  async optimizeSchedule(
    shipment: Shipment,
    constraints: ScheduleConstraints
  ): Promise<AIAgentResponse<ScheduleOptimization>> {
    try {
      const [
        portOperations,
        carrierAvailability,
        historicalDelays
      ] = await Promise.all([
        this.portSchedules.getOperationHours(shipment.route),
        this.carrierSchedules.getAvailability(shipment.route),
        this.bufferCalculator.getHistoricalDelays(shipment.route)
      ]);

      const prompt = await this.generatePrompt('schedule-optimization', {
        shipment,
        constraints,
        portOperations,
        carrierAvailability,
        historicalDelays,
        preferences: this.context.preferences
      });

      const response = await this.callAI(prompt, scheduleOptimizationSchema);

      // Transform the response.data to match ScheduleOptimization type
      const transformedData: ScheduleOptimization = {
        ...response.data,
        recommendedSchedule: {
          ...response.data.recommendedSchedule,
          transitPoints: response.data.recommendedSchedule.transitPoints.map(tp => ({
            ...tp,
            location: {
              ...tp.location,
              code: tp.location.code || tp.location.name // Fallback if code is missing
            }
          }))
        }
      };

      // Validate the generated schedule
      const validation = this.validator.validate(transformedData, constraints);
      if (!validation.isValid) {
        throw new Error(`Invalid schedule: ${validation.violations.map(v => v.message).join(', ')}`);
      }

      return {
        ...response,
        data: this.enrichSchedule(transformedData, validation.warnings)
      };
    } catch (error) {
      ErrorLogger.error('Schedule optimization failed', error as Error);
      throw error;
    }
  }

  async handleScheduleDisruption(
    shipment: Shipment,
    disruption: Disruption
  ): Promise<AIAgentResponse<ScheduleOptimization>> {
    try {
      const impact = await this.disruptionHandler.assessImpact(shipment, disruption);
      const recoveryPlans = await this.recoveryPlanner.generatePlans(shipment, {
        maxDelay: impact.delayEstimate,
        preserveConnections: true
      });

      const prompt = await this.generatePrompt('disruption-recovery', {
        shipment,
        disruption,
        impact,
        recoveryPlans
      });

      return await this.callAI(prompt, scheduleOptimizationSchema);
    } catch (error) {
      ErrorLogger.error('Disruption handling failed', error as Error);
      throw error;
    }
  }

  private enrichSchedule(
    schedule: ScheduleOptimization,
    warnings: string[]
  ): ScheduleOptimization {
    return {
      ...schedule,
      warnings,
      metadata: {
        lastUpdated: new Date(),
        generatedBy: 'scheduling-agent'
      }
    };
  }


}