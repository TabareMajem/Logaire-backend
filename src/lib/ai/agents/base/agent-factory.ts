import { ErrorLogger } from '@/lib/errors/logger';
import { BaseAgent, BaseAgentConfig } from './base-agent';

export class AgentFactory {
  private static instance: AgentFactory;
  private agentRegistry: Map<string, typeof BaseAgent> = new Map();

  private constructor() {}

  static getInstance(): AgentFactory {
    if (!this.instance) {
      this.instance = new AgentFactory();
    }
    return this.instance;
  }

  registerAgent(name: string, agentClass: typeof BaseAgent): void {
    if (this.agentRegistry.has(name)) {
      throw new Error(`Agent type ${name} is already registered`);
    }
    this.agentRegistry.set(name, agentClass);
  }

  createAgent(name: string, config: BaseAgentConfig): BaseAgent {
    const AgentClass = this.agentRegistry.get(name);
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${name}`);
    }

    try {
      return new AgentClass(config);
    } catch (error) {
      ErrorLogger.error(`Failed to create agent ${name}:`, error as Error);
      throw error;
    }
  }

  getRegisteredAgents(): string[] {
    return Array.from(this.agentRegistry.keys());
  }
}

export const agentFactory = AgentFactory.getInstance();