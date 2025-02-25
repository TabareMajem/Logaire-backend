import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

interface AgentRegistration {
  type: string;
  capabilities: string[];
  description: string;
  config?: Record<string, any>;
}

export class AgentRegistry {
  private static instance: AgentRegistry;
  private registeredAgents: Map<string, AgentRegistration>;
  private capabilities: Map<string, Set<string>> = new Map();

  private constructor() {
    this.registeredAgents = new Map();
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  async registerAgent(registration: AgentRegistration): Promise<void> {
    try {
      // Store in memory
      this.registeredAgents.set(registration.type, registration);

      // Persist to database
      const { error } = await supabase
        .from('agent_registry')
        .upsert({
          agent_type: registration.type,
          capabilities: registration.capabilities,
          description: registration.description,
          config: registration.config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to register agent', error as Error);
      throw error;
    }
  }

  async getAgent(type: string): Promise<AgentRegistration | null> {
    try {
      // Check memory cache first
      if (this.registeredAgents.has(type)) {
        return this.registeredAgents.get(type) || null;
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('agent_registry')
        .select('*')
        .eq('agent_type', type)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Cache in memory
      const registration: AgentRegistration = {
        type: data.agent_type,
        capabilities: data.capabilities,
        description: data.description,
        config: data.config
      };
      this.registeredAgents.set(type, registration);

      return registration;
    } catch (error) {
      ErrorLogger.error('Failed to get agent registration', error as Error);
      return null;
    }
  }

  async listAgents(): Promise<AgentRegistration[]> {
    try {
      const { data, error } = await supabase
        .from('agent_registry')
        .select('*')
        .order('agent_type');

      if (error) throw error;
      return data.map(record => ({
        type: record.agent_type,
        capabilities: record.capabilities,
        description: record.description,
        config: record.config
      }));
    } catch (error) {
      ErrorLogger.error('Failed to list agents', error as Error);
      return [];
    }
  }

  async updateAgentConfig(
    type: string,
    config: Record<string, any>
  ): Promise<void> {
    try {
      const registration = await this.getAgent(type);
      if (!registration) {
        throw new Error(`Agent ${type} not found`);
      }

      registration.config = {
        ...registration.config,
        ...config
      };

      await this.registerAgent(registration);
    } catch (error) {
      ErrorLogger.error('Failed to update agent config', error as Error);
      throw error;
    }
  }

  public hasCapability(agentType: string, taskType: string): boolean {
    const tasks = this.capabilities.get(agentType);
    return tasks ? tasks.has(taskType) : false;
  }
}