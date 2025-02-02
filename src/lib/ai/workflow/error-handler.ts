import { ErrorLogger } from '@/lib/errors/logger';
import { AlertManager } from '@/lib/monitoring/alerts/alert-manager';
import { metricsService } from '@/services/metrics-service';
import { Workflow, WorkflowStep } from './types';

interface ErrorHandlingConfig {
  maxRetries: number;
  backoffMultiplier: number;
  alertThreshold: number;
  recoveryStrategies: {
    [key: string]: RecoveryStrategy;
  };
}

interface RecoveryStrategy {
  action: 'retry' | 'skip' | 'fallback' | 'abort';
  fallbackStep?: string;
  conditions?: {
    errorType?: string[];
    stepType?: string[];
    metrics?: {
      field: string;
      operator: '>' | '<' | '==' | '>=';
      value: number;
    }[];
  };
}

export class WorkflowErrorHandler {
  private config: ErrorHandlingConfig;
  private alertManager: AlertManager;
  private errorCounts: Map<string, number>;

  constructor(config: ErrorHandlingConfig, alertManager: AlertManager) {
    this.config = config;
    this.alertManager = alertManager;
    this.errorCounts = new Map();
  }

  async handleError(
    error: Error,
    workflow: Workflow,
    step: WorkflowStep
  ): Promise<{
    action: 'continue' | 'abort';
    updatedStep?: Partial<WorkflowStep>;
  }> {
    try {
      // Log error
      ErrorLogger.error(`Workflow ${workflow.id} step ${step.id} failed:`, error);

      // Update error counts
      this.updateErrorCount(workflow.id, step.id);

      // Record metrics
      await this.recordErrorMetrics(workflow, step, error);

      // Check if we should alert
      await this.checkAlertThreshold(workflow, step);

      // Determine recovery strategy
      const strategy = this.determineRecoveryStrategy(error, step);

      // Apply recovery strategy
      return this.applyRecoveryStrategy(strategy, workflow, step);
    } catch (handlingError) {
      ErrorLogger.error('Error handling failed:', handlingError as Error);
      return { action: 'abort' };
    }
  }

  private updateErrorCount(workflowId: string, stepId: string): void {
    const key = `${workflowId}:${stepId}`;
    const count = (this.errorCounts.get(key) || 0) + 1;
    this.errorCounts.set(key, count);
  }

  private async recordErrorMetrics(
    workflow: Workflow,
    step: WorkflowStep,
    error: Error
  ): Promise<void> {
    await metricsService.insertMetrics([
      {
        type: 'workflow_error',
        value: 1,
        metadata: {
          workflowId: workflow.id,
          stepId: step.id,
          errorType: error.name,
          errorMessage: error.message,
          retryCount: step.retryCount
        }
      }
    ]);
  }

  private async checkAlertThreshold(
    workflow: Workflow,
    step: WorkflowStep
  ): Promise<void> {
    const key = `${workflow.id}:${step.id}`;
    const errorCount = this.errorCounts.get(key) || 0;

    if (errorCount >= this.config.alertThreshold) {
      await this.alertManager.createAlert({
        type: 'workflow_error',
        severity: 'high',
        title: `Workflow Step Error Threshold Exceeded`,
        message: `Step ${step.id} in workflow ${workflow.id} has failed ${errorCount} times`,
        metadata: {
          workflowId: workflow.id,
          stepId: step.id,
          errorCount
        }
      });
    }
  }

  private determineRecoveryStrategy(
    error: Error,
    step: WorkflowStep
  ): RecoveryStrategy {
    // Check each strategy's conditions
    for (const [, strategy] of Object.entries(this.config.recoveryStrategies)) {
      if (this.matchesConditions(error, step, strategy.conditions)) {
        return strategy;
      }
    }

    // Default strategy
    return {
      action: step.retryCount < this.config.maxRetries ? 'retry' : 'abort'
    };
  }

  private matchesConditions(
    error: Error,
    step: WorkflowStep,
    conditions?: RecoveryStrategy['conditions']
  ): boolean {
    if (!conditions) return false;

    if (conditions.errorType && !conditions.errorType.includes(error.name)) {
      return false;
    }

    if (conditions.stepType && !conditions.stepType.includes(step.agentId)) {
      return false;
    }

    if (conditions.metrics) {
      // Implement metric condition checking
      // This would involve checking current metrics against conditions
    }

    return true;
  }

  private async applyRecoveryStrategy(
    strategy: RecoveryStrategy,
    workflow: Workflow,
    step: WorkflowStep
  ): Promise<{
    action: 'continue' | 'abort';
    updatedStep?: Partial<WorkflowStep>;
  }> {
    switch (strategy.action) {
      case 'retry':
        return {
          action: 'continue',
          updatedStep: {
            status: 'pending',
            retryCount: step.retryCount + 1
          }
        };

      case 'skip':
        return {
          action: 'continue',
          updatedStep: {
            status: 'completed',
            output: { skipped: true }
          }
        };

      case 'fallback':
        if (!strategy.fallbackStep) {
          throw new Error('Fallback step not specified');
        }
        return {
          action: 'continue',
          updatedStep: {
            agentId: strategy.fallbackStep,
            status: 'pending',
            retryCount: 0
          }
        };

      case 'abort':
      default:
        return { action: 'abort' };
    }
  }

  clearErrorCounts(): void {
    this.errorCounts.clear();
  }
} 