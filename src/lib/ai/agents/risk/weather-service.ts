import { supabase } from '@/lib/supabase/client';
import { Route } from '../../types/routing';
import { RiskFactor, RiskSeverity } from '../../types/risk';
import { ErrorLogger } from '@/lib/errors/logger';
import { Location } from '../..';

interface WeatherData {
  location: Location;
  forecast: Array<{
    timestamp: Date;
    conditions: string;
    temperature: number;
    windSpeed: number;
    precipitation: number;
    visibility: number;
  }>;
}

export class WeatherService {
  private supabase = supabase;

  async getForecast(route: Route): Promise<RiskFactor[]> {
    try {
      const risks: RiskFactor[] = [];
      const locations = [route.origin, ...route.via, route.destination];

      for (const location of locations) {
        const forecast = await this.fetchWeatherData(location);
        const weatherRisks = this.analyzeWeatherRisks(forecast, location);
        risks.push(...weatherRisks);
      }

      return this.prioritizeRisks(risks);
    } catch (error) {
      ErrorLogger.error('Weather forecast failed', error as Error);
      throw error;
    }
  }

  private async fetchWeatherData(location: Location): Promise<WeatherData> {
    const { data, error } = await this.supabase
      .rpc('get_weather_forecast', {
        latitude: location.coordinates[0],
        longitude: location.coordinates[1]
      });

    if (error) throw error;
    return data;
  }

  private analyzeWeatherRisks(
    forecast: WeatherData,
    location: Location
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];

    forecast.forecast.forEach(period => {
      if (this.isSevereWeather(period)) {
        risks.push({
          category: 'weather',
          severity: this.determineWeatherSeverity(period),
          likelihood: this.calculateLikelihood(period),
          impact: this.describeWeatherImpact(period),
          mitigation: this.suggestMitigationMeasures(period),
          location,
          timeframe: {
            start: period.timestamp,
            end: new Date(period.timestamp.getTime() + 24 * 60 * 60 * 1000)
          }
        });
      }
    });

    return risks;
  }

  private isSevereWeather(conditions: any): boolean {
    return (
      conditions.windSpeed > 50 ||
      conditions.visibility < 1000 ||
      conditions.precipitation > 25
    );
  }

  private determineWeatherSeverity(conditions: any): RiskSeverity {
    if (conditions.windSpeed > 100 || conditions.visibility < 100) {
      return 'critical';
    }
    if (conditions.windSpeed > 75 || conditions.visibility < 500) {
      return 'high';
    }
    if (conditions.windSpeed > 50 || conditions.visibility < 1000) {
      return 'medium';
    }
    return 'low';
  }

  private calculateLikelihood(conditions: any): number {
    // Implementation
    return 0.5;
  }

  private describeWeatherImpact(conditions: any): string {
    // Implementation
    return 'Weather conditions may affect operations';
  }

  private suggestMitigationMeasures(conditions: any): string[] {
    // Implementation
    return ['Monitor weather conditions', 'Prepare contingency plans'];
  }

  private prioritizeRisks(risks: RiskFactor[]): RiskFactor[] {
    return risks.sort((a, b) => {
      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 };
      return severityScore[b.severity] - severityScore[a.severity];
    });
  }
}