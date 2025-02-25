import { ErrorLogger } from '@/lib/errors/logger';
import { ErrorRecoverySystem } from '@/lib/errors/recovery-system';
import { metricsCollector, MetricType } from '@/lib/monitoring/metrics/metrics-collector';
import { BaseAgent } from './base-agent';

export interface EnhancedAgentOptions {
  maxRetries?: number;
  timeout?: number;
  recoveryEnabled?: boolean;
  validateOutput?: boolean;
}

export abstract class EnhancedBaseAgent extends BaseAgent {
  protected options: Required<EnhancedAgentOptions>;

  constructor(id: string, options: EnhancedAgentOptions = {}) {
    super(id, {
      id,
      type: 'enhanced',
      enabled: true
    });
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 30000,
      recoveryEnabled: options.recoveryEnabled ?? true,
      validateOutput: options.validateOutput ?? true,
    };
  }

  async process(input: any): Promise<any> {
    const startTime = Date.now();
    this.status = 'processing';

    try {
      let result;
      if (this.options.recoveryEnabled) {
        result = await ErrorRecoverySystem.attemptRecovery(
          () => this.processWithTimeout(input),
          `${this.id}_process`,
          this.options.timeout
        );
      } else {
        result = await this.processWithTimeout(input);
      }

      if (this.options.validateOutput) {
        await this.validateResult(result);
      }

      await this.trackMetrics('process', startTime);
      this.status = 'idle';
      return result;
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  protected abstract processInternal(input: any): Promise<any>;
  protected abstract validateResult(result: any): Promise<void>;

  private async processWithTimeout(input: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Processing timeout after ${this.options.timeout}ms`));
      }, this.options.timeout);

      try {
        const result = await this.processInternal(input);
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  protected async recordMetric(
    type: MetricType,
    value: number,
    tags: Record<string, string> = {}
  ): Promise<void> {
    await metricsCollector.recordMetric(type, value, {
      agentId: this.id,
      ...tags
    });
  }

  protected logError(error: Error, context?: string): void {
    ErrorLogger.error(`Agent ${this.id} ${context || 'error'}:`, error);
  }
}
