import { BasePortConnector } from './base-connector';
import { ErrorLogger } from '@/lib/errors/logger';

interface WeatherConditions {
  condition: string;
  temperature: number;
  windSpeed: number;
  visibility: number;
  precipitation?: number;
  forecast?: Array<{
    timestamp: Date;
    condition: string;
    temperature: number;
    windSpeed: number;
  }>;
}

export class WeatherConnector extends BasePortConnector {
  async getCurrentConditions(): Promise<WeatherConditions> {
    try {
      const conditions = await this.makeRequest<any>(
        `/api/ports/${this.portId}/weather/current`
      );
      return this.mapWeatherConditions(conditions);
    } catch (error) {
      ErrorLogger.error('Failed to get weather conditions', error as Error);
      throw error;
    }
  }

  async getForecast(days: number = 3): Promise<WeatherConditions[]> {
    try {
      const forecast = await this.makeRequest<any[]>(
        `/api/ports/${this.portId}/weather/forecast`,
        {
          method: 'POST',
          body: JSON.stringify({ days })
        }
      );
      return forecast.map(f => this.mapWeatherConditions(f));
    } catch (error) {
      ErrorLogger.error('Failed to get weather forecast', error as Error);
      throw error;
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${process.env.WEATHER_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  private mapWeatherConditions(data: any): WeatherConditions {
    return {
      condition: data.condition,
      temperature: data.temperature,
      windSpeed: data.wind_speed,
      visibility: data.visibility,
      precipitation: data.precipitation,
      forecast: data.forecast?.map((f: any) => ({
        timestamp: new Date(f.timestamp),
        condition: f.condition,
        temperature: f.temperature,
        windSpeed: f.wind_speed
      }))
    };
  }
}