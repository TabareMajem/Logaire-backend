import { ErrorLogger } from '@/lib/errors/logger';
import { metricsService } from '@/services/metrics-service';
import { workflowAnalytics } from '../analytics/workflow-analytics';
import { Workflow, WorkflowStep } from '../workflow/types';

export interface OptimizationSuggestion {
  type: 'configuration' | 'resource' | 'parallelization' | 'caching';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: {
    performance: number; // Estimated improvement percentage
    cost: number; // Estimated cost impact
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'complex';
    steps: string[];
    config?: Record<string, any>;
  };
}

export class PerformanceOptimizer {
  private readonly PERFORMANCE_THRESHOLDS = {
    responseTime: 5000, // 5 seconds
    errorRate: 0.1, // 10%
    resourceUtilization: 0.8, // 80%
    parallelizationThreshold: 3 // Minimum steps for parallelization
  };

  async analyzeAndOptimize(workflow: Workflow): Promise<OptimizationSuggestion[]> {
    try {
      const analytics = await workflowAnalytics.analyzePerformance(workflow.id);
      const suggestions: OptimizationSuggestion[] = [];

      // Analyze step performance
      for (const stepMetric of analytics.stepMetrics) {
        const stepSuggestions = await this.analyzeStepPerformance(
          workflow,
          stepMetric
        );
        suggestions.push(...stepSuggestions);
      }

      // Analyze workflow-level optimizations
      const workflowSuggestions = await this.analyzeWorkflowStructure(
        workflow,
        analytics
      );
      suggestions.push(...workflowSuggestions);

      // Record optimization suggestions
      await this.recordOptimizationMetrics(workflow.id, suggestions);

      return this.prioritizeSuggestions(suggestions);
    } catch (error) {
      ErrorLogger.error('Error in performance optimization:', error as Error);
      throw error;
    }
  }

  private async analyzeStepPerformance(
    workflow: Workflow,
    stepMetric: any
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];
    const step = workflow.steps.find((s: { id: any; }) => s.id === stepMetric.id);

    if (!step) return suggestions;

    // Check response time
    if (stepMetric.agentMetrics.responseTime > this.PERFORMANCE_THRESHOLDS.responseTime) {
      suggestions.push(this.createResourceOptimizationSuggestion(step));
    }

    // Check error rate
    if (stepMetric.agentMetrics.errorRate > this.PERFORMANCE_THRESHOLDS.errorRate) {
      suggestions.push(this.createReliabilityOptimizationSuggestion(step));
    }

    // Check for caching opportunities
    if (this.canBenefitFromCaching(step, stepMetric)) {
      suggestions.push(this.createCachingSuggestion(step));
    }

    return suggestions;
  }

  private async analyzeWorkflowStructure(
    workflow: Workflow,
    analytics: any
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for parallelization opportunities
    const parallelizableSteps = this.findParallelizableSteps(workflow);
    if (parallelizableSteps.length >= this.PERFORMANCE_THRESHOLDS.parallelizationThreshold) {
      suggestions.push(this.createParallelizationSuggestion(parallelizableSteps));
    }

    // Check resource utilization
    if (analytics.resourceUtilization.cpu > this.PERFORMANCE_THRESHOLDS.resourceUtilization) {
      suggestions.push(this.createResourceBalancingSuggestion(workflow));
    }

    return suggestions;
  }

  private createResourceOptimizationSuggestion(
    step: WorkflowStep
  ): OptimizationSuggestion {
    return {
      type: 'resource',
      priority: 'high',
      description: `Optimize resource allocation for step ${step.id}`,
      impact: {
        performance: 30,
        cost: 20
      },
      implementation: {
        difficulty: 'medium',
        steps: [
          'Increase compute resources',
          'Implement request batching',
          'Add result caching'
        ],
        config: {
          resourceScale: 1.5,
          batchSize: 10,
          cacheTimeout: 300
        }
      }
    };
  }

  private createReliabilityOptimizationSuggestion(
    step: WorkflowStep
  ): OptimizationSuggestion {
    return {
      type: 'configuration',
      priority: 'high',
      description: `Improve reliability for step ${step.id}`,
      impact: {
        performance: 20,
        cost: 10
      },
      implementation: {
        difficulty: 'medium',
        steps: [
          'Implement retry mechanism',
          'Add circuit breaker',
          'Enhance error handling'
        ],
        config: {
          maxRetries: 3,
          backoffMultiplier: 1.5,
          circuitBreakerThreshold: 5
        }
      }
    };
  }

  private createCachingSuggestion(
    step: WorkflowStep
  ): OptimizationSuggestion {
    return {
      type: 'caching',
      priority: 'medium',
      description: `Implement result caching for step ${step.id}`,
      impact: {
        performance: 40,
        cost: 5
      },
      implementation: {
        difficulty: 'easy',
        steps: [
          'Add Redis cache',
          'Implement cache key generation',
          'Set up cache invalidation'
        ],
        config: {
          cacheTimeout: 3600,
          maxCacheSize: '100MB'
        }
      }
    };
  }

  private createParallelizationSuggestion(
    steps: WorkflowStep[]
  ): OptimizationSuggestion {
    return {
      type: 'parallelization',
      priority: 'high',
      description: 'Parallelize independent workflow steps',
      impact: {
        performance: 50,
        cost: 30
      },
      implementation: {
        difficulty: 'complex',
        steps: [
          'Identify independent steps',
          'Implement parallel execution',
          'Add synchronization points'
        ],
        config: {
          maxConcurrency: steps.length,
          stepIds: steps.map(s => s.id)
        }
      }
    };
  }

  private createResourceBalancingSuggestion(
    workflow: Workflow
  ): OptimizationSuggestion {
    return {
      type: 'resource',
      priority: 'medium',
      description: 'Balance resource utilization across workflow',
      impact: {
        performance: 25,
        cost: 15
      },
      implementation: {
        difficulty: 'medium',
        steps: [
          'Implement load balancing',
          'Add resource scaling',
          'Set up monitoring'
        ],
        config: {
          targetUtilization: 0.7,
          scalingFactor: 1.2
        }
      }
    };
  }

  private canBenefitFromCaching(step: WorkflowStep, metrics: any): boolean {
    return (
      metrics.agentMetrics.responseTime > 1000 &&
      step.retryCount === 0 &&
      !step.metadata?.cached
    );
  }

  private findParallelizableSteps(workflow: Workflow): WorkflowStep[] {
    const dependencyMap = new Map<string, Set<string>>();
    
    // Build dependency map
    workflow.steps.forEach((step: { id: string; dependencies: Iterable<string> | null | undefined; }) => {
      dependencyMap.set(step.id, new Set(step.dependencies));
    });

    // Find independent steps
    return workflow.steps.filter((step: { id: string; }) => {
      const dependencies = dependencyMap.get(step.id);
      return !dependencies || dependencies.size === 0;
    });
  }

  private prioritizeSuggestions(
    suggestions: OptimizationSuggestion[]
  ): OptimizationSuggestion[] {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    
    return suggestions.sort((a, b) => {
      const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact.performance - a.impact.performance;
    });
  }

  private async recordOptimizationMetrics(
    workflowId: string,
    suggestions: OptimizationSuggestion[]
  ): Promise<void> {
    await metricsService.insertMetrics([
      {
        type: 'optimization_suggestions',
        workflowId,
        value: suggestions.length,
        metadata: {
          highPriority: suggestions.filter(s => s.priority === 'high').length,
          totalImpact: suggestions.reduce((sum, s) => sum + s.impact.performance, 0),
          types: suggestions.map(s => s.type)
        }
      }
    ]);
  }
}

export const performanceOptimizer = new PerformanceOptimizer(); 