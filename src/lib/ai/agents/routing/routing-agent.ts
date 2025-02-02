

import { BaseAgent } from '../../base-agent';
import { AIAgentContext, AIAgentResponse } from '../../types';
import { ErrorLogger } from '@/lib/errors/logger';
import { MarketDataService } from './market-data-service';
import { RouteHistoryService } from './route-history-service';
import { RiskAnalysisService } from './risk-analysis-service';
import {
  Location,
  Route,
  RouteConstraints,
  routeSchema
} from '../../types/routing';
import { z } from 'zod';
import { Disruption } from '../../types/shipment';

export class RoutingAgent extends BaseAgent {
  private marketData: MarketDataService;
  private history: RouteHistoryService;
  private riskAnalysis: RiskAnalysisService;

  constructor(context: AIAgentContext) {
    super(context);
    this.marketData = new MarketDataService();
    this.history = new RouteHistoryService();
    this.riskAnalysis = new RiskAnalysisService();
  }

  async optimizeRoute(
    origin: Location,
    destination: Location,
    constraints: RouteConstraints
  ): Promise<AIAgentResponse<Route>> {
    try {
      const [marketConditions, historicalData] = await Promise.all([
        this.marketData.getCurrentConditions(),
        this.history.getRouteHistory(origin, destination)
      ]);

      const prompt = await this.generatePrompt('route-optimization', {
        origin,
        destination,
        constraints,
        marketConditions,
        historicalData,
        preferences: this.context.preferences
      });

      const response = await this.callAI(prompt, routeSchema);
      
      // Enrich with risk analysis
      const risks = await this.riskAnalysis.analyzeRoute(response.data);
      return {
        ...response,
        data: {
          ...response.data,
          risks
        }
      };
    } catch (error) {
      ErrorLogger.error('Route optimization failed', error as Error);
      throw error;
    }
  }

  async suggestAlternatives(
    currentRoute: Route,
    issue: Disruption
  ): Promise<AIAgentResponse<Route[]>> {
    try {
      const prompt = await this.generatePrompt('route-alternatives', {
        currentRoute,
        issue,
        marketConditions: await this.marketData.getCurrentConditions()
      });

      return await this.callAI(prompt, z.array(routeSchema));
    } catch (error) {
      ErrorLogger.error('Alternative routes suggestion failed', error as Error);
      throw error;
    }
  }
}