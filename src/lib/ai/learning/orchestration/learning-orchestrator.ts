import { ExperienceStore } from '../experience/experience-store';
import { PerformanceAnalyzer } from '../analysis/performance-analyzer';
import { PatternDetector } from '../analysis/pattern-detector';
import { TrendAnalyzer } from '../analysis/trend-analyzer';
import { AnomalyDetector } from '../analysis/anomaly-detector';
import { StrategyOptimizer } from '../optimization/strategy-optimizer';
import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class LearningOrchestrator {
  private experienceStore: ExperienceStore;
  private performanceAnalyzer: PerformanceAnalyzer;
  private patternDetector: PatternDetector;
  private trendAnalyzer: TrendAnalyzer;
  private anomalyDetector: AnomalyDetector;
  private strategyOptimizer: StrategyOptimizer;

  constructor() {
    this.experienceStore = new ExperienceStore();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.patternDetector = new PatternDetector();
    this.trendAnalyzer = new TrendAnalyzer();
    this.anomalyDetector = new AnomalyDetector();
    this.strategyOptimizer = new StrategyOptimizer();
  }

  async processExperience(experience: AgentExperience): Promise<void> {
    try {
      // Store experience
      await this.experienceStore.store(experience);

      // Get recent experiences for analysis
      const recentExperiences = await this.experienceStore.getRecentExperiences(
        experience.agentType
      );

      // Run parallel analyses
      const [
        performanceMetrics,
        patterns,
        trends,
        anomalies
      ] = await Promise.all([
        this.performanceAnalyzer.analyzePerformance(recentExperiences),
        this.patternDetector.detectPatterns(recentExperiences),
        this.trendAnalyzer.analyzeTrends(recentExperiences),
        this.anomalyDetector.detectAnomalies(recentExperiences)
      ]);

      const performanceMetricsRecord: Record<string, number> = {
        successRate: performanceMetrics.successRate,
        averageLatency: performanceMetrics.averageLatency,
        errorRate: performanceMetrics.errorRate,
        throughput: performanceMetrics.throughput,
      };
      

      // Optimize strategy if needed
      if (this.shouldOptimizeStrategy(performanceMetricsRecord, anomalies)) {
        await this.strategyOptimizer.optimizeStrategy(
          this.getCurrentStrategy(),
          performanceMetricsRecord
        );
      }
    } catch (error) {
      ErrorLogger.error('Failed to process experience', error as Error);
      throw error;
    }
  }

  private shouldOptimizeStrategy(
    metrics: Record<string, number>,
    anomalies: Array<any>
  ): boolean {
    return (
      metrics.overallScore < 0.8 ||
      anomalies.some(a => a.severity === 'high')
    );
  }

  private getCurrentStrategy(): Record<string, number> {
    // Implementation to get current strategy
    return {};
  }
}