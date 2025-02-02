import { AgentOrchestrator } from '../agents/base/agent-orchestrator';
import { AgentMonitor } from '../agents/base/agent-monitor';
import { AgentType } from '../agents/base/agent-factory';
import { AIAgentContext, AIAgentResponse } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class AgentCoordinator {
  private orchestrator: AgentOrchestrator;
  private monitor: AgentMonitor;

  constructor(context: AIAgentContext) {
    this.orchestrator = new AgentOrchestrator(context);
    this.monitor = new AgentMonitor();
  }

  async executeAgentTask<T>(params: {
    agentType: AgentType;
    taskType: string;
    input: Record<string, any>;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<AIAgentResponse<T>> {
    const startTime = Date.now();

    try {
      const result = await this.orchestrator.executeTask<T>(params.agentType, {
        type: params.taskType,
        input: params.input,
        requirements: {
          priority: params.priority || 'medium'
        }
      });

      // Record metrics
      await this.monitor.recordMetrics({
        agentType: params.agentType,
        taskType: params.taskType,
        duration: Date.now() - startTime,
        success: true,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      // Record failure metrics
      await this.monitor.recordMetrics({
        agentType: params.agentType,
        taskType: params.taskType,
        duration: Date.now() - startTime,
        success: false,
        confidence: 0
      });

      ErrorLogger.error('Agent task execution failed', error as Error);
      throw error;
    }
  }

  async checkAgentHealth(agentType: AgentType): Promise<{
    healthy: boolean;
    metrics: {
      successRate: number;
      averageLatency: number;
      errorRate: number;
    };
  }> {
    try {
      const isHealthy = await this.monitor.checkAgentHealth(agentType);
      const metrics = await this.monitor.getAgentMetrics(agentType);

      return {
        healthy: isHealthy,
        metrics: {
          successRate: metrics.successRate,
          averageLatency: metrics.averageLatency,
          errorRate: metrics.errorRate
        }
      };
    } catch (error) {
      ErrorLogger.error('Agent health check failed', error as Error);
      throw error;
    }
  }
}