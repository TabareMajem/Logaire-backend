import { AgentType } from './agent-factory';
import { ErrorLogger } from '@/lib/errors/logger';

interface AgentMetrics {
  successRate: number;
  averageLatency: number;
  errorRate: number;
  lastUpdated: Date;
}

export class AgentMonitor {
  private metrics = new Map<AgentType, AgentMetrics>();

  async recordExecution(params: {
    agentType: AgentType;
    duration: number;
    success: boolean;
    error?: Error;
  }): Promise<void> {
    try {
      const currentMetrics = this.metrics.get(params.agentType) || this.getDefaultMetrics();
      const updatedMetrics = this.updateMetrics(currentMetrics, params);
      this.metrics.set(params.agentType, updatedMetrics);

      // Log execution
      this.logExecution(params);

      // Check health thresholds
      await this.checkHealthThresholds(params.agentType, updatedMetrics);
    } catch (error) {
      ErrorLogger.error('Failed to record agent execution', error as Error);
    }
  }

  async getAgentMetrics(agentType: AgentType): Promise<AgentMetrics> {
    return this.metrics.get(agentType) || this.getDefaultMetrics();
  }

  private getDefaultMetrics(): AgentMetrics {
    return {
      successRate: 1,
      averageLatency: 0,
      errorRate: 0,
      lastUpdated: new Date()
    };
  }

  private updateMetrics(
    current: AgentMetrics,
    execution: { duration: number; success: boolean }
  ): AgentMetrics {
    const totalExecutions = 100; // Rolling window size
    const newExecutions = 1;

    return {
      successRate: this.calculateNewAverage(
        current.successRate,
        execution.success ? 1 : 0,
        totalExecutions,
        newExecutions
      ),
      averageLatency: this.calculateNewAverage(
        current.averageLatency,
        execution.duration,
        totalExecutions,
        newExecutions
      ),
      errorRate: this.calculateNewAverage(
        current.errorRate,
        execution.success ? 0 : 1,
        totalExecutions,
        newExecutions
      ),
      lastUpdated: new Date()
    };
  }

  private calculateNewAverage(
    currentAvg: number,
    newValue: number,
    totalCount: number,
    newCount: number
  ): number {
    return ((currentAvg * (totalCount - newCount)) + (newValue * newCount)) / totalCount;
  }

  private async checkHealthThresholds(
    agentType: AgentType,
    metrics: AgentMetrics
): Promise<void> {
    const THRESHOLDS = {
      errorRate: 0.1, // 10%
      latency: 5000, // 5 seconds
      successRate: 0.9 // 90%
    };

    if (metrics.errorRate > THRESHOLDS.errorRate ||
        metrics.averageLatency > THRESHOLDS.latency ||
        metrics.successRate < THRESHOLDS.successRate) {
      const error = new Error('Agent health check failed');
      Object.assign(error, {
        metadata: {
          agentType,
          metrics,
          thresholds: THRESHOLDS
        }
      });
      ErrorLogger.warn(error.toString());
    }
}

  private logExecution(params: {
    agentType: AgentType;
    duration: number;
    success: boolean;
    error?: Error;
  }): void {
    if (params.success) {
      ErrorLogger.info('Agent execution successful', {
        agentType: params.agentType,
        duration: params.duration
      });
    } else {
      ErrorLogger.error('Agent execution failed', params.error as Error, {
        agentType: params.agentType,
        duration: params.duration
      });
    }
  }
}