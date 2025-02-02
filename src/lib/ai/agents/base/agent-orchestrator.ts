import { ErrorLogger } from '@/lib/errors/logger';
import { AgentFactory } from './agent-factory';
import { AgentMonitor } from './agent-monitor';
import { AgentRegistry } from './agent-registry';
import { AgentResult, AgentTask } from './types';

export class AgentOrchestrator {
  private readonly factory: AgentFactory;
  private readonly monitor: AgentMonitor;

  constructor() {
    this.factory = new AgentFactory();
    this.monitor = new AgentMonitor();
  }

  async executeTask(
    agentType: string,
    task: AgentTask,
    context: Record<string, any> = {}
  ): Promise<AgentResult> {
    try {
      // Validate agent type and capability
      if (!AgentRegistry.hasCapability(agentType, task.type)) {
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
        const result = await agent.execute(task);

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