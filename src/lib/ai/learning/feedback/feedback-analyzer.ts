import { supabase } from '@/lib/supabase/client';
import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface FeedbackAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence: number;
}

export class FeedbackAnalyzer {
  private readonly supabase = supabase;

  async analyzeFeedback(experiences: AgentExperience[]): Promise<FeedbackAnalysis> {
    try {
      const strengths = await this.identifyStrengths(experiences);
      const weaknesses = await this.identifyWeaknesses(experiences);
      const recommendations = await this.generateRecommendations(
        strengths,
        weaknesses
      );

      const analysis: FeedbackAnalysis = {
        strengths,
        weaknesses,
        recommendations,
        confidence: this.calculateConfidence(experiences)
      };

      await this.storeFeedbackAnalysis(analysis);
      return analysis;
    } catch (error) {
      ErrorLogger.error('Feedback analysis failed', error as Error);
      throw error;
    }
  }

  private async identifyStrengths(experiences: AgentExperience[]): Promise<string[]> {
    const strengths: string[] = [];
    const metrics = this.calculateAverageMetrics(experiences);

    if (metrics.accuracy > 0.9) {
      strengths.push('High accuracy consistently achieved');
    }
    if (metrics.latency < 1000) {
      strengths.push('Excellent response times');
    }
    if (metrics.resourceEfficiency > 0.8) {
      strengths.push('Efficient resource utilization');
    }

    return strengths;
  }

  private async identifyWeaknesses(experiences: AgentExperience[]): Promise<string[]> {
    const weaknesses: string[] = [];
    const metrics = this.calculateAverageMetrics(experiences);

    if (metrics.accuracy < 0.8) {
      weaknesses.push('Accuracy below target threshold');
    }
    if (metrics.latency > 2000) {
      weaknesses.push('High latency issues detected');
    }
    if (metrics.resourceEfficiency < 0.6) {
      weaknesses.push('Suboptimal resource utilization');
    }

    return weaknesses;
  }

  private async generateRecommendations(
    strengths: string[],
    weaknesses: string[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Add recommendations based on weaknesses
    for (const weakness of weaknesses) {
      const recommendation = await this.getRecommendationForWeakness(weakness);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Add recommendations for maintaining strengths
    for (const strength of strengths) {
      const recommendation = await this.getRecommendationForStrength(strength);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  private calculateAverageMetrics(experiences: AgentExperience[]): {
    accuracy: number;
    latency: number;
    resourceEfficiency: number;
  } {
    const avgAccuracy = experiences.reduce((sum, exp) => sum + exp.accuracy, 0) / experiences.length;
    const avgLatency = experiences.reduce((sum, exp) => sum + exp.duration, 0) / experiences.length;
    const avgResourceUsage = experiences.reduce((sum, exp) => sum + exp.resourceUsage, 0) / experiences.length;

    return {
      accuracy: avgAccuracy,
      latency: avgLatency,
      resourceEfficiency: 1 - (avgResourceUsage / 1000) // Normalize to 0-1
    };
  }

  private calculateConfidence(experiences: AgentExperience[]): number {
    if (experiences.length < 10) {
      return 0.5 + (experiences.length * 0.05); // Lower confidence for small sample sizes
    }

    const recentExperiences = experiences.slice(-10);
    const consistencyScore = this.calculateConsistencyScore(recentExperiences);
    
    return Math.min(0.95, consistencyScore);
  }

  private calculateConsistencyScore(experiences: AgentExperience[]): number {
    const accuracyVariance = this.calculateVariance(
      experiences.map(e => e.accuracy)
    );
    const qualityVariance = this.calculateVariance(
      experiences.map(e => e.quality)
    );

    return 1 - ((accuracyVariance + qualityVariance) / 2);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private async getRecommendationForWeakness(weakness: string): Promise<string | null> {
    // Implementation for getting recommendations based on weaknesses
    return null;
  }

  private async getRecommendationForStrength(strength: string): Promise<string | null> {
    // Implementation for getting recommendations based on strengths
    return null;
  }

  private async storeFeedbackAnalysis(analysis: FeedbackAnalysis): Promise<void> {
    const { error } = await this.supabase
      .from('feedback_analysis')
      .insert({
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}