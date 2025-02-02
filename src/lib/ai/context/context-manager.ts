// src/lib/ai/context/context-manager.ts -->

import { MarketDataService } from './services/market-data-service';
import { PerformanceService } from './services/performance-service';
import { PreferencesService } from './services/preferences-service';
import { EnvironmentalService } from './services/environmental-service';
import { AIAgentContext, MarketConditions, UserPreferences } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';
import { EnvironmentalData, PerformanceMetrics } from './types';

export interface EnhancedContext extends AIAgentContext {
  marketConditions: MarketConditions;
  historicalPerformance: PerformanceMetrics;
  userPreferences: UserPreferences;
  environmentalFactors: EnvironmentalData;
}

export class ContextManager {
  private marketData: MarketDataService;
  private performance: PerformanceService;
  private preferences: PreferencesService;
  private environmental: EnvironmentalService;

  constructor() {
    this.marketData = new MarketDataService();
    this.performance = new PerformanceService();
    this.preferences = new PreferencesService();
    this.environmental = new EnvironmentalService();
  }

  async buildContext(baseContext: AIAgentContext): Promise<EnhancedContext> {
    try {
      const [
        marketData,
        performance,
        preferences,
        environmental
      ] = await Promise.all([
        this.marketData.getCurrentConditions(),
        this.performance.getHistoricalPerformance(baseContext.companyId),
        this.preferences.getUserPreferences(baseContext.userId),
        this.environmental.getEnvironmentalData()
      ]);

      return {
        ...baseContext,
        marketConditions: marketData,
        historicalPerformance: performance,
        userPreferences: preferences,
        environmentalFactors: environmental
      };
    } catch (error) {
      ErrorLogger.error('Failed to build enhanced context', error as Error);
      throw error;
    }
  }
}