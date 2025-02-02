import { Workflow, WorkflowStep } from '@/lib/ai/workflow/types';
import { ErrorLogger } from '@/lib/errors/logger';
import { metricsService } from '@/services/metrics-service';
import { AlertManager, AlertType } from './alert-manager';

export interface WorkflowAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved';
  workflowId: string;
  stepId?: string;
}

export class WorkflowAlertMonitor {
  private alertManager: AlertManager;
  private readonly THRESHOLDS = {
    executionTime: 300000, // 5 minutes
    errorRate: 0.2, // 20%
    resourceUtilization: 0.9, // 90%
    stepDuration: 60000, // 1 minute
    retryAttempts: 3
  };

  constructor(alertManager: AlertManager) {
    this.alertManager = alertManager;
  }

  async monitorWorkflow(workflow: Workflow): Promise<void> {
    try {
      await Promise.all([
        this.checkExecutionTime(workflow),
        this.checkErrorRates(workflow),
        this.checkResourceUtilization(workflow),
        this.checkStepPerformance(workflow),
        this.checkAgentHealth(workflow)
      ]);
    } catch (error) {
      ErrorLogger.error('Error monitoring workflow:', error as Error);
    }
  }

  private async checkExecutionTime(workflow: Workflow): Promise<void> {
    if (!workflow.startTime) return;

    const duration = Date.now() - new Date(workflow.startTime).getTime();
    if (duration > this.THRESHOLDS.executionTime) {
      await this.alertManager.createAlert({
        type: 'workflow_long_execution',
        severity: 'medium',
        title: `Long execution time for workflow ${workflow.id}`,
        message: `Workflow has been running for ${Math.round(duration / 1000)}s`,
        metadata: {
          workflowId: workflow.id,
          duration,
          expectedDuration: this.THRESHOLDS.executionTime
        }
      });
    }
  }

  private async checkErrorRates(workflow: Workflow): Promise<void> {
    const errorCount = workflow.steps.filter(s => s.status === 'failed').length;
    const errorRate = errorCount / workflow.steps.length;

    if (errorRate > this.THRESHOLDS.errorRate) {
      await this.alertManager.createAlert({
        type: 'workflow_high_error_rate',
        severity: 'high',
        title: `High error rate in workflow ${workflow.id}`,
        message: `Error rate of ${(errorRate * 100).toFixed(1)}% exceeds threshold`,
        metadata: {
          workflowId: workflow.id,
          errorRate,
          errorCount,
          totalSteps: workflow.steps.length
        }
      });
    }
  }

  private async checkResourceUtilization(workflow: Workflow): Promise<void> {
    const metrics = await metricsService.getLatestMetrics(workflow.id, 'resource');
    
    if (metrics.cpu > this.THRESHOLDS.resourceUtilization) {
      await this.alertManager.createAlert({
        type: 'workflow_high_cpu',
        severity: 'high',
        title: `High CPU utilization in workflow ${workflow.id}`,
        message: `CPU usage at ${(metrics.cpu * 100).toFixed(1)}%`,
        metadata: {
          workflowId: workflow.id,
          cpu: metrics.cpu,
          memory: metrics.memory
        }
      });
    }

    if (metrics.memory > this.THRESHOLDS.resourceUtilization) {
      await this.alertManager.createAlert({
        type: 'workflow_high_memory',
        severity: 'high',
        title: `High memory utilization in workflow ${workflow.id}`,
        message: `Memory usage at ${(metrics.memory * 100).toFixed(1)}%`,
        metadata: {
          workflowId: workflow.id,
          cpu: metrics.cpu,
          memory: metrics.memory
        }
      });
    }
  }

  private async checkStepPerformance(workflow: Workflow): Promise<void> {
    for (const step of workflow.steps) {
      if (step.status !== 'completed' && step.status !== 'failed') {
        await this.checkStepDuration(workflow, step);
      }

      if (step.retryCount > this.THRESHOLDS.retryAttempts) {
        await this.alertManager.createAlert({
          type: 'workflow_step_retries',
          severity: 'high',
          title: `Excessive retries for step ${step.id}`,
          message: `Step has been retried ${step.retryCount} times`,
          metadata: {
            workflowId: workflow.id,
            stepId: step.id,
            retryCount: step.retryCount,
            status: step.status
          }
        });
      }
    }
  }

  private async checkStepDuration(
    workflow: Workflow,
    step: WorkflowStep
  ): Promise<void> {
    if (!step.startTime) return;

    const duration = Date.now() - new Date(step.startTime).getTime();
    if (duration > this.THRESHOLDS.stepDuration) {
      await this.alertManager.createAlert({
        type: 'workflow_step_duration',
        severity: 'medium',
        title: `Long running step ${step.id}`,
        message: `Step has been running for ${Math.round(duration / 1000)}s`,
        metadata: {
          workflowId: workflow.id,
          stepId: step.id,
          duration,
          agentId: step.agentId
        }
      });
    }
  }

  private async checkAgentHealth(workflow: Workflow): Promise<void> {
    const agentMetrics = await metricsService.getAgentMetrics(workflow.id);
    
    for (const [agentId, metrics] of Object.entries(agentMetrics)) {
      if (metrics.errorRate > this.THRESHOLDS.errorRate) {
        await this.alertManager.createAlert({
          type: 'agent_high_error_rate',
          severity: 'high',
          title: `High error rate for agent ${agentId}`,
          message: `Agent error rate of ${(metrics.errorRate * 100).toFixed(1)}%`,
          metadata: {
            workflowId: workflow.id,
            agentId,
            errorRate: metrics.errorRate,
            responseTime: metrics.responseTime
          }
        });
      }
    }
  }
} 