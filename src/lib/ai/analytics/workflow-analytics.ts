import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { metricsService } from '@/services/metrics-service';
import { Workflow, WorkflowStep } from '../workflow/types';

export interface PerformanceMetrics {
  executionTime: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    tokens: number;
  };
  stepMetrics: {
    id: string;
    duration: number;
    retries: number;
    status: string;
    agentMetrics: {
      responseTime: number;
      accuracy: number;
      errorRate: number;
    };
  }[];
  bottlenecks: {
    stepId: string;
    type: 'duration' | 'error' | 'resource';
    severity: 'low' | 'medium' | 'high';
    details: string;
  }[];
  recommendations: {
    type: 'optimization' | 'scaling' | 'error_handling';
    description: string;
    impact: 'low' | 'medium' | 'high';
    actionItems: string[];
  }[];
}

export class WorkflowAnalytics {
  async analyzePerformance(workflowId: string): Promise<PerformanceMetrics> {
    try {
      const workflow = await this.fetchWorkflowData(workflowId);
      const metrics = await this.collectMetrics(workflowId);
      
      const stepMetrics = await this.analyzeSteps(workflow.steps, metrics);
      const bottlenecks = this.identifyBottlenecks(stepMetrics);
      const recommendations = this.generateRecommendations(stepMetrics, bottlenecks);

      const performanceMetrics: PerformanceMetrics = {
        executionTime: this.calculateExecutionTime(workflow),
        resourceUtilization: await this.calculateResourceUtilization(workflowId),
        stepMetrics,
        bottlenecks,
        recommendations
      };

      // Store analytics results
      await this.storeAnalytics(workflowId, performanceMetrics);

      return performanceMetrics;
    } catch (error) {
      ErrorLogger.error('Error analyzing workflow performance:', error as Error);
      throw error;
    }
  }

  private async fetchWorkflowData(workflowId: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        steps:workflow_steps(*)
      `)
      .eq('id', workflowId)
      .single();

    if (error) throw error;
    return data;
  }

  private async collectMetrics(workflowId: string) {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('workflow_id', workflowId);

    if (error) throw error;
    return data;
  }

  private async analyzeSteps(
    steps: WorkflowStep[],
    metrics: any[]
  ): Promise<PerformanceMetrics['stepMetrics']> {
    return Promise.all(
      steps.map(async (step) => {
        const stepMetrics = metrics.filter(m => m.step_id === step.id);
        const agentMetrics = await this.calculateAgentMetrics(step.agentId, stepMetrics);

        return {
          id: step.id,
          duration: this.calculateStepDuration(step),
          retries: step.retryCount,
          status: step.status,
          agentMetrics
        };
      })
    );
  }

  private calculateStepDuration(step: WorkflowStep): number {
    if (!step.startTime || !step.endTime) return 0;
    return new Date(step.endTime).getTime() - new Date(step.startTime).getTime();
  }

  private async calculateAgentMetrics(agentId: string, metrics: any[]) {
    const responseTimeMetrics = metrics.filter(m => m.type === 'response_time');
    const accuracyMetrics = metrics.filter(m => m.type === 'accuracy');
    const errorMetrics = metrics.filter(m => m.type === 'error');

    return {
      responseTime: this.calculateAverage(responseTimeMetrics.map(m => m.value)),
      accuracy: this.calculateAverage(accuracyMetrics.map(m => m.value)),
      errorRate: errorMetrics.length / metrics.length
    };
  }

  private identifyBottlenecks(
    stepMetrics: PerformanceMetrics['stepMetrics']
  ): PerformanceMetrics['bottlenecks'] {
    const bottlenecks: PerformanceMetrics['bottlenecks'] = [];
    const avgDuration = this.calculateAverage(stepMetrics.map(m => m.duration));
    const stdDevDuration = this.calculateStdDev(stepMetrics.map(m => m.duration));

    stepMetrics.forEach(metric => {
      // Check for duration bottlenecks
      if (metric.duration > avgDuration + 2 * stdDevDuration) {
        bottlenecks.push({
          stepId: metric.id,
          type: 'duration',
          severity: 'high',
          details: `Step duration is significantly higher than average`
        });
      }

      // Check for error bottlenecks
      if (metric.agentMetrics.errorRate > 0.1) {
        bottlenecks.push({
          stepId: metric.id,
          type: 'error',
          severity: metric.agentMetrics.errorRate > 0.3 ? 'high' : 'medium',
          details: `High error rate: ${(metric.agentMetrics.errorRate * 100).toFixed(1)}%`
        });
      }
    });

    return bottlenecks;
  }

  private generateRecommendations(
    stepMetrics: PerformanceMetrics['stepMetrics'],
    bottlenecks: PerformanceMetrics['bottlenecks']
  ): PerformanceMetrics['recommendations'] {
    const recommendations: PerformanceMetrics['recommendations'] = [];

    // Analyze bottlenecks for recommendations
    const durationBottlenecks = bottlenecks.filter(b => b.type === 'duration');
    const errorBottlenecks = bottlenecks.filter(b => b.type === 'error');

    if (durationBottlenecks.length > 0) {
      recommendations.push({
        type: 'optimization',
        description: 'Performance optimization needed for slow steps',
        impact: 'high',
        actionItems: durationBottlenecks.map(b => 
          `Optimize step ${b.stepId} to reduce execution time`
        )
      });
    }

    if (errorBottlenecks.length > 0) {
      recommendations.push({
        type: 'error_handling',
        description: 'Improve error handling and reliability',
        impact: 'high',
        actionItems: errorBottlenecks.map(b =>
          `Implement better error handling for step ${b.stepId}`
        )
      });
    }

    // Check for scaling recommendations
    const highLoadSteps = stepMetrics.filter(m => 
      m.agentMetrics.responseTime > 1000 || m.retries > 2
    );

    if (highLoadSteps.length > 0) {
      recommendations.push({
        type: 'scaling',
        description: 'Consider scaling agent resources',
        impact: 'medium',
        actionItems: highLoadSteps.map(s =>
          `Scale resources for agent handling step ${s.id}`
        )
      });
    }

    return recommendations;
  }

  private calculateExecutionTime(workflow: Workflow): number {
    if (!workflow.startTime) return 0;
    const end = workflow.endTime ? new Date(workflow.endTime) : new Date();
    return end.getTime() - new Date(workflow.startTime).getTime();
  }

  private async calculateResourceUtilization(
    workflowId: string
  ): Promise<PerformanceMetrics['resourceUtilization']> {
    const { data, error } = await supabase
      .from('resource_metrics')
      .select('*')
      .eq('workflow_id', workflowId);

    if (error) throw error;

    return {
      cpu: this.calculateAverage(data.map(m => m.cpu_usage)),
      memory: this.calculateAverage(data.map(m => m.memory_usage)),
      tokens: data.reduce((sum, m) => sum + (m.token_usage || 0), 0)
    };
  }

  private async storeAnalytics(
    workflowId: string,
    metrics: PerformanceMetrics
  ): Promise<void> {
    await metricsService.insertMetrics([
      {
        type: 'workflow_performance',
        workflowId,
        value: metrics.executionTime,
        metadata: {
          resourceUtilization: metrics.resourceUtilization,
          bottlenecks: metrics.bottlenecks.length,
          recommendations: metrics.recommendations.length
        }
      }
    ]);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateStdDev(values: number[]): number {
    const avg = this.calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.calculateAverage(squareDiffs));
  }
}

export const workflowAnalytics = new WorkflowAnalytics(); 