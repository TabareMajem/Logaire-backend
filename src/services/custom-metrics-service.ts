import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { CustomMetricDefinition } from '@/types/monitoring';
import { EventEmitter } from 'events';
import { metricsAggregationService } from './metrics-aggregation-service';

class CustomMetricsService extends EventEmitter {
  private static instance: CustomMetricsService;
  private definitions: Map<string, CustomMetricDefinition> = new Map();
  private evaluationTimers: Map<string, NodeJS.Timer> = new Map();

  private constructor() {
    super();
    this.loadDefinitions();
  }

  static getInstance(): CustomMetricsService {
    if (!this.instance) {
      this.instance = new CustomMetricsService();
    }
    return this.instance;
  }

  private async loadDefinitions(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('custom_metric_definitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      data.forEach(def => {
        this.definitions.set(def.id, def);
        if (def.enabled) {
          this.startEvaluation(def.id);
        }
      });
    } catch (error) {
      ErrorLogger.error('Failed to load custom metric definitions', error as Error);
    }
  }

  async createDefinition(definition: Omit<CustomMetricDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomMetricDefinition> {
    try {
      const { data, error } = await supabase
        .from('custom_metric_definitions')
        .insert([definition])
        .select()
        .single();

      if (error) throw error;

      const newDefinition = data as CustomMetricDefinition;
      this.definitions.set(newDefinition.id, newDefinition);
      
      if (newDefinition.enabled) {
        this.startEvaluation(newDefinition.id);
      }

      this.emit('definitionCreated', newDefinition);
      return newDefinition;
    } catch (error) {
      ErrorLogger.error('Failed to create custom metric definition', error as Error);
      throw error;
    }
  }

  private async evaluateMetric(definition: CustomMetricDefinition): Promise<number> {
    const metrics = await Promise.all(
      definition.baseMetrics.map(async (metricType) => {
        const data = await metricsAggregationService.getAggregatedMetrics(
          metricType,
          '5m',
          new Date(Date.now() - 5 * 60 * 1000),
          new Date()
        );
        return data[0]?.avgValue ?? 0;
      })
    );

    // Evaluate formula
    const formula = JSON.parse(definition.formula);
    switch (formula.operation) {
      case 'sum':
        return metrics.reduce((a, b) => a + b, 0);
      case 'avg':
        return metrics.reduce((a, b) => a + b, 0) / metrics.length;
      case 'max':
        return Math.max(...metrics);
      case 'min':
        return Math.min(...metrics);
      case 'multiply':
        return metrics.reduce((a, b) => a * b, 1);
      case 'divide':
        return metrics[0] / (metrics[1] || 1);
      default:
        throw new Error(`Unknown operation: ${formula.operation}`);
    }
  }

  private startEvaluation(definitionId: string): void {
    const definition = this.definitions.get(definitionId);
    if (!definition) return;

    const timer = setInterval(async () => {
      try {
        const value = await this.evaluateMetric(definition);
        await this.saveMetricValue(definitionId, value);
      } catch (error) {
        ErrorLogger.error(`Failed to evaluate custom metric ${definitionId}`, error as Error);
      }
    }, 60000); // Every minute

    this.evaluationTimers.set(definitionId, timer);
  }

  private async saveMetricValue(definitionId: string, value: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_metrics')
        .insert([{
          definition_id: definitionId,
          value,
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to save custom metric value', error as Error);
    }
  }

  getDefinitions(): CustomMetricDefinition[] {
    return Array.from(this.definitions.values());
  }

  cleanup(): void {
    this.evaluationTimers.forEach(timer => clearInterval(timer));
    this.evaluationTimers.clear();
    this.removeAllListeners();
  }
}

export const customMetricsService = CustomMetricsService.getInstance(); 