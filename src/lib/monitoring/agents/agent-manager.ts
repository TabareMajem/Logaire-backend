import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { EventEmitter } from 'events';
import { AgentConfig, MetricData, MonitoringAgent } from './base/monitoring-agent';
import { SystemMetricsAgent } from './system-metrics-agent';

export class AgentManager extends EventEmitter {
  private static instance: AgentManager;
  private agents: Map<string, MonitoringAgent> = new Map();
  private isInitialized: boolean = false;

  private constructor() {
    super();
  }

  static getInstance(): AgentManager {
    if (!this.instance) {
      this.instance = new AgentManager();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load agent configurations from database
      const { data: configs, error } = await supabase
        .from('monitoring_agents')
        .select('*')
        .eq('enabled', true);

      if (error) throw error;

      // Initialize agents
      for (const config of configs) {
        await this.createAgent(config);
      }

      this.setupMetricsPersistence();
      this.isInitialized = true;
    } catch (error) {
      ErrorLogger.error('Failed to initialize AgentManager:', error as Error);
      throw error;
    }
  }

  private async createAgent(config: AgentConfig): Promise<void> {
    try {
      let agent: MonitoringAgent;

      switch (config.name) {
        case 'system':
          agent = new SystemMetricsAgent(config);
          break;
        // Add other agent types here
        default:
          throw new Error(`Unknown agent type: ${config.name}`);
      }

      this.setupAgentListeners(agent);
      this.agents.set(config.id, agent);
      await agent.start();
    } catch (error) {
      ErrorLogger.error(`Failed to create agent ${config.id}:`, error as Error);
      throw error;
    }
  }

  private setupAgentListeners(agent: MonitoringAgent): void {
    agent.on('metrics', async ({ metrics }) => {
      try {
        await this.persistMetrics(metrics);
        this.emit('metrics', { agentId: agent.config.id, metrics });
      } catch (error) {
        ErrorLogger.error('Failed to handle metrics:', error as Error);
      }
    });

    agent.on('error', ({ error }) => {
      ErrorLogger.error(`Agent ${agent.config.id} error:`, error as Error);
      this.emit('agentError', { agentId: agent.config.id, error });
    });
  }

  private async persistMetrics(metrics: MetricData[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('metrics')
        .insert(metrics);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to persist metrics:', error as Error);
      throw error;
    }
  }

  private setupMetricsPersistence(): void {
    // Setup batch processing or real-time persistence
    // This is a simplified version
  }

  async stopAll(): Promise<void> {
    const stopPromises = Array.from(this.agents.values()).map(agent => agent.stop());
    await Promise.all(stopPromises);
    this.agents.clear();
    this.isInitialized = false;
  }

  getAgent(id: string): MonitoringAgent | undefined {
    return this.agents.get(id);
  }

  getAgents(): MonitoringAgent[] {
    return Array.from(this.agents.values());
  }
}

export const agentManager = AgentManager.getInstance(); 