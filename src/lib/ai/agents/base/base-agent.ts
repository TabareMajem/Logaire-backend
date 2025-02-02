import { ErrorLogger } from '@/lib/errors/logger';
import { metricsCollector } from '@/lib/monitoring/metrics/metrics-collector';

export abstract class BaseAgent {
  protected readonly id: string;
  protected status: 'idle' | 'processing' | 'error';

  constructor(id: string) {
    this.id = id;
    this.status = 'idle';
  }

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