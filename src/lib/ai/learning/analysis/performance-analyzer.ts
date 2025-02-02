import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';
import { PerformanceMetrics } from '../../context/types';


export class PerformanceAnalyzer {
  
  async analyzePerformance(experiences: AgentExperience[]): Promise<PerformanceMetrics> {
    try {
      const metrics: PerformanceMetrics = {
        accuracy: this.calculateAccuracy(experiences),
        latency: this.calculateLatency(experiences),
        resourceEfficiency: this.calculateResourceEfficiency(experiences),
        qualityScore: this.calculateQualityScore(experiences),
        successRate: this.calculateSuccessRate(experiences),
        averageLatency: this.calculateLatency(experiences), // Assuming it uses the same calculation
        errorRate: this.calculateErrorRate(experiences),
        throughput: this.calculateThroughput(experiences),
        lastUpdated: new Date(), // Add the current timestamp
        overallScore: 0, // Placeholder
      };
  
      metrics.overallScore = this.calculateOverallScore(metrics);
      return metrics;
    } catch (error) {
      ErrorLogger.error('Performance analysis failed', error as Error);
      throw error;
    }
  }

  private calculateErrorRate(experiences: AgentExperience[]): number {
    if (experiences.length === 0) return 0;
    const failedExperiences = experiences.filter(exp => !exp.success).length;
    return failedExperiences / experiences.length;
  }
  
  private calculateThroughput(experiences: AgentExperience[]): number {
    if (experiences.length === 0) return 0;
    return experiences.length; // Assuming throughput is the count of experiences
  }

  private calculateSuccessRate(experiences: AgentExperience[]): number {
    if (experiences.length === 0) return 0;
    const successfulExperiences = experiences.filter(exp => exp.success).length;
    return successfulExperiences / experiences.length;
  }

  private calculateAccuracy(experiences: AgentExperience[]): number {
    if (experiences.length === 0) return 0;
    return experiences.reduce((sum, exp) => sum + exp.accuracy, 0) / experiences.length;
  }

  private calculateLatency(experiences: AgentExperience[]): number {
    if (experiences.length === 0) return 0;
    return experiences.reduce((sum, exp) => sum + exp.duration, 0) / experiences.length;
  }

  private calculateResourceEfficiency(experiences: AgentExperience[]): number {
    if (experiences.length === 0) return 1;
    const avgUsage = experiences.reduce((sum, exp) => sum + exp.resourceUsage, 0) / experiences.length;
    return Math.max(0, 1 - (avgUsage / 1000)); // Normalize to 0-1 range
  }

  private calculateQualityScore(experiences: AgentExperience[]): number {
    if (experiences.length === 0) return 0;
    return experiences.reduce((sum, exp) => sum + exp.quality, 0) / experiences.length;
  }

  private calculateOverallScore(metrics: Omit<PerformanceMetrics, 'overallScore'>): number {
    const weights = {
      accuracy: 0.4,
      latency: 0.2,
      resourceEfficiency: 0.2,
      qualityScore: 0.2
    };

    return (
      metrics.accuracy * weights.accuracy +
      (1 - Math.min(metrics.latency / 5000, 1)) * weights.latency +
      metrics.resourceEfficiency * weights.resourceEfficiency +
      metrics.qualityScore * weights.qualityScore
    );
  }
}