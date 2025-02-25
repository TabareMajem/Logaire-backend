import { ErrorLogger } from '@/lib/errors/logger';
import { metricsCollector } from '@/lib/monitoring/metrics/metrics-collector';
import { AgentConfig } from './types';

export type BaseAgentConfig = AgentConfig;

export abstract class BaseAgent {
  protected readonly id: string;
  protected status: 'idle' | 'processing' | 'error';
  protected config: BaseAgentConfig;

  constructor(id: string, config: BaseAgentConfig) {
    this.id = id;
    this.status = 'idle';
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract process(input: any): Promise<any>;

  protected async trackMetrics(operation: string, startTime: number): Promise<void> {
    const duration = Date.now() - startTime;
    await metricsCollector.recordMetric('agent_performance', duration, {
      agentId: this.id,
      operation
    });
  }

  protected handleError(error: Error): never {
    this.status = 'error';
    ErrorLogger.error(`Agent ${this.id} error:`, error);
    throw error;
  }
} 