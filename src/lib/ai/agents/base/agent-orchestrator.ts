import { ErrorLogger } from '@/lib/errors/logger';
import { AgentFactory } from './agent-factory';
import { AgentMonitor } from './agent-monitor';
import { AgentRegistry } from './agent-registry';
import { AgentResult, AgentTask } from './types';
import { BaseAgent, BaseAgentConfig } from './base-agent';

export class AgentOrchestrator {
  private readonly factory: AgentFactory;
  private readonly monitor: AgentMonitor;

  constructor() {
    this.factory = AgentFactory.getInstance(); // Use singleton instance
    this.monitor = new AgentMonitor();
  }

  async executeTask(
    agentType: string,
    task: AgentTask,
    context: BaseAgentConfig = { id: '', type: '', enabled: true } // Use proper BaseAgentConfig type with defaults
  ): Promise<AgentResult> {
    try {
      // Validate agent type and capability
      if (!AgentRegistry.getInstance().hasCapability(agentType, task.type)) {
        // Fixed: Get instance first, assuming AgentRegistry follows similar singleton pattern
        throw new Error(
          `Agent type ${agentType} does not support task type ${task.type}`
        );
      }

      // Create agent instance
      const agent = this.factory.createAgent(agentType, context);

      // Start monitoring
      const executionId = await this.monitor.startExecution(agentType, task);

      try {
        // Execute task
        // Fixed: Add explicit type check or cast to ensure execute method exists
        const result = await (agent as BaseAgent & { execute: (task: AgentTask) => Promise<AgentResult> }).execute(task);

        // Record successful execution
        await this.monitor.completeExecution(executionId, result);

        return result;
      } catch (error) {
        // Record failed execution
        await this.monitor.failExecution(executionId, error as Error);
        throw error;
      }
    } catch (error) {
      ErrorLogger.error('Task orchestration failed', error as Error);
      throw error;
    }
  }

  async getAgentMetrics(agentType: string) {
    return this.monitor.getMetrics(agentType);
  }

  async getActiveExecutions() {
    return this.monitor.getActiveExecutions();
  }
}