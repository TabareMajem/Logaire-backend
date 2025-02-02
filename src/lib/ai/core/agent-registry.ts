import { AgentType } from './agent-factory';
import { ProcessingPipeline } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

interface AgentRegistration {
  type: AgentType;
  pipeline: ProcessingPipeline;
  config: {
    defaultModel: string;
    minConfidence: number;
    maxLatency: number;
  };
}

export class AgentRegistry {
  private static registry = new Map<AgentType, AgentRegistration>();

  static register(registration: AgentRegistration): void {
    try {
      this.validateRegistration(registration);
      this.registry.set(registration.type, registration);
    } catch (error) {
      ErrorLogger.error('Agent registration failed', error as Error);
      throw error;
    }
  }

  static getAgent(type: AgentType): AgentRegistration {
    const agent = this.registry.get(type);
    if (!agent) {
      throw new Error(`Agent type not registered: ${type}`);
    }
    return agent;
  }

  static listAgents(): AgentType[] {
    return Array.from(this.registry.keys());
  }

  private static validateRegistration(registration: AgentRegistration): void {
    if (!registration.type) {
      throw new Error('Agent type is required');
    }

    if (!registration.pipeline) {
      throw new Error('Processing pipeline is required');
    }

    if (!registration.pipeline.rules || registration.pipeline.rules.length === 0) {
      throw new Error('Pipeline must have at least one rule');
    }
  }
}