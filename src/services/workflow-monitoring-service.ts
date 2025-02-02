import { ErrorLogger } from '@/lib/errors/logger';
import { AlertManager } from '@/lib/monitoring/alerts/alert-manager';
import { supabase } from '@/lib/supabase/client';
import { EventEmitter } from 'events';

interface WorkflowUpdate {
  workflowId: string;
  type: 'status' | 'step' | 'error' | 'metric';
  data: any;
}

export class WorkflowMonitoringService extends EventEmitter {
  private static instance: WorkflowMonitoringService;
  private subscription: any;
  private alertManager: AlertManager;
  private activeWorkflows: Set<string>;

  private constructor() {
    super();
    this.alertManager = new AlertManager();
    this.activeWorkflows = new Set();
  }

  static getInstance(): WorkflowMonitoringService {
    if (!this.instance) {
      this.instance = new WorkflowMonitoringService();
    }
    return this.instance;
  }

  async startMonitoring(workflowId: string): Promise<void> {
    if (this.activeWorkflows.has(workflowId)) return;

    try {
      // Subscribe to workflow updates
      this.subscription = supabase
        .channel(`workflow-${workflowId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workflows',
            filter: `id=eq.${workflowId}`
          },
          (payload) => this.handleWorkflowUpdate(payload.new)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workflow_steps',
            filter: `workflow_id=eq.${workflowId}`
          },
          (payload) => this.handleStepUpdate(payload.new)
        )
        .subscribe();

      this.activeWorkflows.add(workflowId);

      // Start performance monitoring
      await this.startPerformanceMonitoring(workflowId);
    } catch (error) {
      ErrorLogger.error('Failed to start workflow monitoring:', error as Error);
      throw error;
    }
  }

  async stopMonitoring(workflowId: string): Promise<void> {
    if (!this.activeWorkflows.has(workflowId)) return;

    try {
      await this.subscription?.unsubscribe();
      this.activeWorkflows.delete(workflowId);
    } catch (error) {
      ErrorLogger.error('Failed to stop workflow monitoring:', error as Error);
      throw error;
    }
  }

  private async handleWorkflowUpdate(workflow: any): Promise<void> {
    this.emit('workflowUpdate', {
      workflowId: workflow.id,
      type: 'status',
      data: workflow
    });

    // Check for completion or failure
    if (workflow.status === 'completed' || workflow.status === 'failed') {
      await this.handleWorkflowCompletion(workflow);
    }
  }

  private async handleStepUpdate(step: any): Promise<void> {
    this.emit('workflowUpdate', {
      workflowId: step.workflow_id,
      type: 'step',
      data: step
    });

    // Monitor step performance
    if (step.status === 'completed') {
      await this.recordStepPerformance(step);
    }
  }

  private async handleWorkflowCompletion(workflow: any): Promise<void> {
    try {
      // Record final metrics
      await this.recordWorkflowMetrics(workflow);

      // Generate completion report
      const report = await this.generateCompletionReport(workflow);

      // Send alerts if needed
      if (workflow.status === 'failed') {
        await this.alertManager.createAlert({
          type: 'workflow_failed',
          severity: 'high',
          title: `Workflow ${workflow.id} Failed`,
          message: `Workflow execution failed: ${workflow.error}`,
          metadata: {
            workflowId: workflow.id,
            error: workflow.error,
            duration: this.calculateDuration(workflow)
          }
        });
      }

      this.emit('workflowComplete', {
        workflowId: workflow.id,
        status: workflow.status,
        report
      });
    } catch (error) {
      ErrorLogger.error('Error handling workflow completion:', error as Error);
    }
  }

  private async startPerformanceMonitoring(workflowId: string): Promise<void> {
    // Start periodic performance checks
    setInterval(async () => {
      try {
        const metrics = await this.collectPerformanceMetrics(workflowId);
        this.emit('workflowUpdate', {
          workflowId,
          type: 'metric',
          data: metrics
        });
      } catch (error) {
        ErrorLogger.error('Error collecting performance metrics:', error as Error);
      }
    }, 5000); // Every 5 seconds
  }

  private async collectPerformanceMetrics(workflowId: string): Promise<any> {
    // Implement metric collection logic
    return {};
  }

  private async recordStepPerformance(step: any): Promise<void> {
    // Implement step performance recording logic
  }

  private async recordWorkflowMetrics(workflow: any): Promise<void> {
    // Implement workflow metrics recording logic
  }

  private async generateCompletionReport(workflow: any): Promise<any> {
    // Implement report generation logic
    return {};
  }

  private calculateDuration(workflow: any): number {
    if (!workflow.start_time) return 0;
    const end = workflow.end_time ? new Date(workflow.end_time) : new Date();
    return end.getTime() - new Date(workflow.start_time).getTime();
  }
}

export const workflowMonitoringService = WorkflowMonitoringService.getInstance(); 