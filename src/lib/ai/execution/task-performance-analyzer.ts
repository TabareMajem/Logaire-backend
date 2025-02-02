import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { AgentType } from '../agents/base/agent-factory';

interface PerformanceMetrics {
  averageLatency: number;
  p95Latency: number;
  successRate: number;
  errorRate: number;
  throughput: number;
}

export class TaskPerformanceAnalyzer {
  private readonly supabase = supabase;

  async analyzePerformance(params: {
    agentType?: AgentType;
    taskType?: string;
    timeframe?: number;
  }): Promise<PerformanceMetrics> {
    try {
      const { data, error } = await this.supabase
        .rpc('analyze_task_performance', {
          agent_type: params.agentType,
          task_type: params.taskType,
          lookback_seconds: params.timeframe || 3600
        });

      if (error) throw error;

      return {
        averageLatency: data.average_latency,
        p95Latency: data.p95_latency,
        successRate: data.success_rate,
        errorRate: data.error_rate,
        throughput: data.throughput
      };
    } catch (error) {
      ErrorLogger.error('Performance analysis failed', error as Error);
      throw error;
    }
  }

  async getPerformanceTrends(timeframe: number = 24 * 3600): Promise<{
    latencyTrend: 'improving' | 'stable' | 'degrading';
    successRateTrend: 'improving' | 'stable' | 'degrading';
    throughputTrend: 'increasing' | 'stable' | 'decreasing';
  }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_performance_trends', {
          lookback_seconds: timeframe
        });

      if (error) throw error;

      // Map the throughput trend to the correct type
      const mapTrendToThroughput = (trend: 'improving' | 'stable' | 'degrading'): 'increasing' | 'stable' | 'decreasing' => {
        if (trend === 'improving') return 'increasing';
        if (trend === 'degrading') return 'decreasing';
        return 'stable';
      };

      return {
        latencyTrend: this.analyzeTrend(data.latency_trend),
        successRateTrend: this.analyzeTrend(data.success_rate_trend),
        throughputTrend: mapTrendToThroughput(this.analyzeTrend(data.throughput_trend))
      };
    } catch (error) {
      ErrorLogger.error('Failed to get performance trends', error as Error);
      throw error;
    }
  }

  private analyzeTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    const THRESHOLD = 0.1; // 10% change threshold
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.average(firstHalf);
    const secondAvg = this.average(secondHalf);
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < THRESHOLD) return 'stable';
    return change > 0 ? 'improving' : 'degrading';
  }

  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
}