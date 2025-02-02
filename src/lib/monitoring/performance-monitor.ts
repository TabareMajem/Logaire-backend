import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

interface PerformanceMetrics {
  agentType: string;
  taskType: string;
  duration: number;
  success: boolean;
  confidence: number;
  modelUsed: string;
  tokensUsed: number;
  cost: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any[]>;

  private constructor() {
    this.metrics = new Map();
  }

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  async recordMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Store in memory for real-time analysis
      this.updateLocalMetrics(metrics);

      // Persist to database
      await this.persistMetrics(metrics);

      // Check for anomalies
      await this.checkAnomalies(metrics);

    } catch (error) {
      ErrorLogger.error('Failed to record metrics', error as Error);
    }
  }

  private updateLocalMetrics(metrics: PerformanceMetrics): void {
    const key = `${metrics.agentType}-${metrics.taskType}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)?.push({
      ...metrics,
      timestamp: new Date()
    });
  }

  private async persistMetrics(metrics: PerformanceMetrics): Promise<void> {
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        ...metrics,
        recorded_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  private async checkAnomalies(metrics: PerformanceMetrics): Promise<void> {
    const threshold = await this.getThreshold(metrics.agentType);
    
    if (metrics.duration > threshold.maxDuration ||
        metrics.confidence < threshold.minConfidence ||
        metrics.cost > threshold.maxCost) {
      await this.reportAnomaly(metrics);
    }
  }

  async getPerformanceReport(
    agentType: string,
    timeRange: { start: Date; end: Date }
  ): Promise<any> {
    // Implementation
    return {};
  }
} 