import { AgentFactory, AgentType } from './agent-factory';
import { AIContext, AIResponse } from './types';
import { ErrorLogger } from '@/lib/errors/logger';
import { validateRequiredFields } from '../utils/validation';
import { calculateMetrics } from '../utils/metrics';
import { ExternalServiceManager } from '../external/external-service-manager';

interface OrchestrationRequest {
  agentType: string;
  taskType: string;
  input: Record<string, any>;
  context?: Record<string, any>;
}

export class AgentOrchestrator {
  private externalServices: ExternalServiceManager;

  constructor(private context: AIContext) {
    this.externalServices = new ExternalServiceManager([
      { type: 'anthropic', config: {} }
    ]);
  }

  async executeTask<T>(request: OrchestrationRequest): Promise<AIResponse<T>> {
    const startTime = Date.now();

    try {
      // Validate request
      validateRequiredFields(request, ['agentType', 'taskType', 'input']);

      // Create agent instance
      const agent = AgentFactory.createAgent(request.agentType as AgentType, {
        ...this.context,
        ...request.context
      });

      // Execute task
      const result = await agent.process<T>(request.input);

      // Calculate performance metrics
      const metrics = calculateMetrics(startTime, [result], []);

      // Log success
      this.logSuccess(request, metrics);

      return result;
    } catch (error) {
      // Log error
      ErrorLogger.error('Task execution failed', error as Error, {
        request,
        duration: Date.now() - startTime
      });

      throw error;
    }
  }

  async executeParallelTasks<T>(
    requests: OrchestrationRequest[]
  ): Promise<AIResponse<T>[]> {
    return Promise.all(
      requests.map(request => this.executeTask<T>(request))
    );
  }

  async executeSequentialTasks<T>(
    requests: OrchestrationRequest[]
  ): Promise<AIResponse<T>[]> {
    const results: AIResponse<T>[] = [];

    for (const request of requests) {
      const result = await this.executeTask<T>(request);
      results.push(result);
    }

    return results;
  }

  private logSuccess(request: OrchestrationRequest, metrics: any): void {
    ErrorLogger.info('Task executed successfully', {
      agentType: request.agentType,
      taskType: request.taskType,
      metrics
    });
  }
}