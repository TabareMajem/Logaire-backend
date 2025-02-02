import { ProcessingPipeline, ProcessingRule } from './types';
import { ErrorLogger } from '@/lib/errors/logger';
import { calculateMetrics } from '../utils/metrics';

export class PipelineExecutor {
  async execute<T>(
    pipeline: ProcessingPipeline,
    input: any
  ): Promise<T> {
    const startTime = Date.now();
    let currentData = input;

    try {
      // Execute each rule in sequence
      for (const rule of pipeline.rules) {
        currentData = await this.executeRule(rule, currentData);
      }

      // Calculate metrics
      const metrics = calculateMetrics(startTime, [currentData], []);
      
      // Log success
      this.logSuccess(pipeline.name, metrics);

      return currentData as T;
    } catch (error) {
      // Log error
      ErrorLogger.error('Pipeline execution failed', error as Error, {
        pipeline: pipeline.name,
        duration: Date.now() - startTime
      });

      // Execute fallback if available
      if (pipeline.fallback) {
        return pipeline.fallback(error as Error);
      }

      throw error;
    }
  }

  private async executeRule(
    rule: ProcessingRule,
    data: any
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // Check rule condition
      if (!rule.condition(data)) {
        return data;
      }

      // Execute rule action
      const result = await rule.action(data);

      // Log rule execution
      this.logRuleExecution(rule.id, Date.now() - startTime);

      return result;
    } catch (error) {
      ErrorLogger.error(`Rule ${rule.id} execution failed`, error as Error);
      throw error;
    }
  }

  private logSuccess(pipelineName: string, metrics: any): void {
    ErrorLogger.info('Pipeline executed successfully', {
      pipeline: pipelineName,
      metrics
    });
  }

  private logRuleExecution(ruleId: string, duration: number): void {
    ErrorLogger.info('Rule executed', {
      ruleId,
      duration
    });
  }
}