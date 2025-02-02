import { ErrorLogger } from '@/lib/errors/logger';
import { PortService } from '@/services/port-service';
import { VesselService } from '@/services/vessel-service';
import { WeatherService } from '@/services/weather-service';
import { EnhancedAgent, EnhancedAgentConfig } from '../base/enhanced-agent';

interface RouteOptimizationConfig extends EnhancedAgentConfig {
  optimization: {
    prioritizeCost: number; // 0-1
    prioritizeTime: number; // 0-1
    prioritizeReliability: number; // 0-1
    maxTransshipments: number;
    preferredPorts: string[];
  };
  constraints: {
    maxTransitTime: number;
    maxCost: number;
    requiredETA?: string;
    avoidPorts?: string[];
  };
}

interface RouteContext {
  origin: string;
  destination: string;
  cargo: {
    type: string;
    volume: number;
    weight: number;
    hazmat?: boolean;
  };
  schedule: {
    earliestDeparture: string;
    latestArrival: string;
    flexibility: number;
  };
}

export class RouteAgent extends EnhancedAgent {
  private portService: PortService;
  private vesselService: VesselService;
  private weatherService: WeatherService;
  private config: RouteOptimizationConfig;

  constructor(config: RouteOptimizationConfig) {
    super(config);
    this.config = config;
    this.portService = new PortService();
    this.vesselService = new VesselService();
    this.weatherService = new WeatherService();
  }

  async optimizeRoute(context: RouteContext): Promise<{
    routes: Array<{
      segments: Array<{
        from: string;
        to: string;
        vessel: string;
        departure: string;
        arrival: string;
        reliability: number;
      }>;
      totalCost: number;
      totalTime: number;
      reliability: number;
      co2Emissions: number;
    }>;
    explanation: string;
    confidence: number;
  }> {
    try {
      // Gather required data
      const [portData, vesselData, weatherData] = await Promise.all([
        this.portService.getPortsData(context),
        this.vesselService.getAvailableVessels(context),
        this.weatherService.getForecast(context)
      ]);

      // Generate optimization prompt
      const prompt = await this.promptGenerator.generate('route_optimization', {
        context,
        portData,
        vesselData,
        weatherData,
        config: this.config.optimization
      });

      // Get AI recommendation
      const result = await this.processWithAI(
        { context, portData, vesselData, weatherData },
        {
          currentCongestion: portData.congestionLevels,
          weatherRisks: weatherData.risks,
          vesselReliability: vesselData.reliabilityScores
        },
        'route_optimization'
      );

      // Validate and refine routes
      const refinedRoutes = await this.validateAndRefineRoutes(
        result.routes,
        context
      );

      return {
        routes: refinedRoutes,
        explanation: result.explanation,
        confidence: result.confidence
      };
    } catch (error) {
      ErrorLogger.error('Route optimization failed:', error as Error);
      throw error;
    }
  }

  private async validateAndRefineRoutes(routes: any[], context: RouteContext): Promise<any[]> {
    return Promise.all(
      routes.map(async route => {
        // Validate each segment
        const validatedSegments = await Promise.all(
          route.segments.map(async segment => {
            // Check port availability
            const portAvailability = await this.portService.checkAvailability(
              segment.from,
              segment.to,
              segment.departure
            );

            // Check vessel schedule
            const vesselAvailability = await this.vesselService.checkAvailability(
              segment.vessel,
              segment.departure,
              segment.arrival
            );

            // Adjust timing based on port congestion
            const adjustedTiming = this.adjustForCongestion(
              segment,
              portAvailability.congestion
            );

            return {
              ...segment,
              ...adjustedTiming,
              reliability: this.calculateSegmentReliability(
                segment,
                portAvailability,
                vesselAvailability
              )
            };
          })
        );

        // Recalculate route metrics
        return {
          segments: validatedSegments,
          totalCost: this.calculateTotalCost(validatedSegments),
          totalTime: this.calculateTotalTime(validatedSegments),
          reliability: this.calculateRouteReliability(validatedSegments),
          co2Emissions: await this.calculateCO2Emissions(validatedSegments)
        };
      })
    );
  }

  private calculateSegmentReliability(
    segment: any,
    portAvailability: any,
    vesselAvailability: any
  ): number {
    const portReliability = (portAvailability.from.reliability + portAvailability.to.reliability) / 2;
    const vesselReliability = vesselAvailability.reliability;
    const weatherImpact = this.calculateWeatherImpact(segment);

    return (
      0.4 * portReliability +
      0.4 * vesselReliability +
      0.2 * (1 - weatherImpact)
    );
  }

  private async calculateCO2Emissions(segments: any[]): Promise<number> {
    let totalEmissions = 0;

    for (const segment of segments) {
      const vesselData = await this.vesselService.getVesselDetails(segment.vessel);
      const distance = await this.portService.calculateDistance(
        segment.from,
        segment.to
      );

      totalEmissions += this.calculateSegmentEmissions(
        distance,
        vesselData.emissionsFactor,
        vesselData.capacity
      );
    }

    return totalEmissions;
  }

  private calculateSegmentEmissions(
    distance: number,
    emissionsFactor: number,
    capacity: number
  ): number {
    // Basic CO2 calculation formula
    return (distance * emissionsFactor) / capacity;
  }

  private calculateWeatherImpact(segment: any): number {
    // Implement weather impact calculation
    return 0.1; // Placeholder
  }

  private calculateTotalCost(segments: any[]): number {
    return segments.reduce((total, segment) => total + segment.cost, 0);
  }

  private calculateTotalTime(segments: any[]): number {
    return segments.reduce(
      (total, segment) =>
        total + new Date(segment.arrival).getTime() - new Date(segment.departure).getTime(),
      0
    );
  }

  private calculateRouteReliability(segments: any[]): number {
    // Calculate overall reliability using weighted average
    const weights = segments.map(s => 
      new Date(s.arrival).getTime() - new Date(s.departure).getTime()
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    return segments.reduce((sum, segment, i) => 
      sum + (segment.reliability * weights[i] / totalWeight), 
    0);
  }

  private adjustForCongestion(
    segment: any,
    congestion: { departure: number; arrival: number }
  ): { departure: string; arrival: string } {
    const departureDelay = congestion.departure * 3600000; // Convert hours to milliseconds
    const arrivalDelay = congestion.arrival * 3600000;

    return {
      departure: new Date(new Date(segment.departure).getTime() + departureDelay).toISOString(),
      arrival: new Date(new Date(segment.arrival).getTime() + arrivalDelay).toISOString()
    };
  }
}