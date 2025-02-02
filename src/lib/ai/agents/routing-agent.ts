import { ErrorLogger } from '@/lib/errors/logger';
import { EnhancedBaseAgent } from './base/enhanced-base-agent';
import { AgentResult, AgentTask } from './base/types';
import { RouteDataProvider } from './routing/data-sources/route-data-provider';
import { RouteOptimizer } from './routing/optimization/route-optimizer';
import { WeightedCriteria } from './routing/optimization/types';

interface RouteAnalysis {
  routes: {
    id: string;
    segments: {
      from: string;
      to: string;
      mode: string;
      carrier: string;
      duration: number;
      distance: number;
      cost: number;
      emissions: number;
      reliability: number;
      congestionRisk: number;
    }[];
    totalDuration: number;
    totalDistance: number;
    totalCost: number;
    totalEmissions: number;
    reliability: number;
    risks: {
      type: string;
      probability: number;
      impact: number;
      mitigation?: string;
    }[];
  }[];
  recommendations: {
    routeId: string;
    score: number;
    reasons: string[];
    alternativeOptions: string[];
  };
  confidence: number;
}

export class RoutingAgent extends EnhancedBaseAgent {
  private readonly optimizer: RouteOptimizer;
  private readonly dataProvider: RouteDataProvider;

  constructor() {
    super();
    this.optimizer = new RouteOptimizer();
    this.dataProvider = new RouteDataProvider();
  }

  protected async processTask(
    task: AgentTask,
    model: string,
    prompt: string
  ): Promise<AgentResult> {
    try {
      // Get comprehensive route data
      const routeData = await this.dataProvider.getRouteData(task.input);
      
      // Optimize routes
      const { optimal, alternatives } = this.optimizer.optimizeRoute(
        routeData.routes,
        this.getCriteriaWeights(task)
      );

      // Generate final analysis using AI
      const analysis = await this.analyzeRoutes(
        task.input,
        optimal,
        alternatives,
        routeData,
        model,
        prompt
      );

      return {
        success: true,
        data: {
          optimalRoute: optimal,
          alternatives,
          analysis,
          routeData
        },
        confidence: analysis.confidence
      };
    } catch (error) {
      ErrorLogger.error('Route optimization failed', error as Error);
      throw error;
    }
  }

  private getCriteriaWeights(task: AgentTask): WeightedCriteria {
    // Adjust weights based on task priority and requirements
    return {
      timeWeight: task.priority === 'high' ? 0.4 : 0.25,
      costWeight: task.priority === 'economy' ? 0.4 : 0.25,
      environmentalWeight: task.input.sustainabilityFocus ? 0.4 : 0.25,
      reliabilityWeight: task.priority === 'reliable' ? 0.4 : 0.25
    };
  }

  private async analyzeRoutes(
    input: Record<string, any>,
    routeData: any,
    conditions: any,
    model: string,
    basePrompt: string
  ): Promise<RouteAnalysis> {
    const enhancedPrompt = `
      ${basePrompt}
      
      Shipment Details:
      Origin: ${input.origin}
      Destination: ${input.destination}
      Cargo: ${input.cargoDetails}
      Priority: ${input.priority}
      
      Available Routes:
      ${JSON.stringify(routeData.routes, null, 2)}
      
      Current Conditions:
      Weather: ${conditions.weather}
      Port Congestion: ${conditions.congestion}
      Known Incidents: ${conditions.incidents}
      Restrictions: ${conditions.restrictions}
      
      Please analyze and recommend optimal routes considering:
      1. Total transit time and reliability
      2. Cost efficiency
      3. Environmental impact
      4. Risk factors and alternatives
    `;

    const completion = await this.anthropic.messages.create({
      model,
      messages: [{ role: 'user', content: enhancedPrompt }],
      temperature: 0.3
    });

    return this.parseResponse(completion.content[0].text);
  }

  protected getAgentType(): string {
    return 'routing';
  }

  protected getContext(): Record<string, any> {
    return {
      dataSource: 'real-time',
      updateFrequency: '30min'
    };
  }

  private parseResponse(content: string): RouteAnalysis {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse AI response');
    }
  }
}