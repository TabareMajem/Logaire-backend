import { supabase } from '@/lib/supabase/client';
import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface PerformanceThresholds {
  minAccuracy: number;
  maxLatency: number;
  maxResourceUsage: number;
  minQuality: number;
}

export class PerformanceMonitor {
  private readonly supabase = supabase;
  private readonly defaultThresholds: PerformanceThresholds = {
    minAccuracy: 0.8,
    maxLatency: 2000,
    maxResourceUsage: 0.8,
    minQuality: 0.7
  };

  async monitorPerformance(
    experience: AgentExperience,
    customThresholds?: Partial<PerformanceThresholds>
  ): Promise<{
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const thresholds = { ...this.defaultThresholds, ...customThresholds };
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check accuracy
      if (experience.accuracy < thresholds.minAccuracy) {
        issues.push(`Low accuracy: ${(experience.accuracy * 100).toFixed(1)}%`);
        recommendations.push('Consider increasing model confidence threshold');
      }

      // Check latency
      if (experience.duration > thresholds.maxLatency) {
        issues.push(`High latency: ${experience.duration}ms`);
        recommendations.push('Optimize processing pipeline or reduce batch size');
      }

      // Check resource usage
      if (experience.resourceUsage > thresholds.maxResourceUsage) {
        issues.push(`High resource usage: ${(experience.resourceUsage * 100).toFixed(1)}%`);
        recommendations.push('Implement resource usage limits or optimize memory usage');
      }

      // Check quality
      if (experience.quality < thresholds.minQuality) {
        issues.push(`Low quality score: ${(experience.quality * 100).toFixed(1)}%`);
        recommendations.push('Review and enhance quality control measures');
      }

      await this.recordMonitoringResults(experience, issues);

      return { issues, recommendations };
    } catch (error) {
      ErrorLogger.error('Performance monitoring failed', error as Error);
      throw error;
    }
  }

  private async recordMonitoringResults(
    experience: AgentExperience,
    issues: string[]
  ): Promise<void> {
    const { error } = await this.supabase
      .from('performance_monitoring')
      .insert({
        agent_type: experience.agentType,
        task_type: experience.taskType,
        metrics: {
          accuracy: experience.accuracy,
          duration: experience.duration,
          resource_usage: experience.resourceUsage,
          quality: experience.quality
        },
        issues,
        monitored_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}