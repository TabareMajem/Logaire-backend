import { BaseExternalClient } from '../base-client';
import { ExternalAPIConfig } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface WeatherForecast {
  location: {
    lat: number;
    lon: number;
  };
  forecast: Array<{
    timestamp: string;
    temperature: number;
    windSpeed: number;
    precipitation: number;
    visibility: number;
    conditions: string[];
  }>;
}

interface WeatherAlert {
  severity: 'low' | 'medium' | 'high';
  type: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedArea: {
    lat: number;
    lon: number;
    radius: number;
  };
}

export class WeatherAPIClient extends BaseExternalClient {
  constructor(config: ExternalAPIConfig) {
    super(config);
  }

  async getForecast(lat: number, lon: number, days: number): Promise<WeatherForecast> {
    try {
      const response = await this.request<WeatherForecast>('/forecast', {
        params: {
          lat: lat.toString(),
          lon: lon.toString(),
          days: days.toString()
        }
      });
      return response.data;
    } catch (error) {
      ErrorLogger.error('Failed to fetch weather forecast', error as Error);
      throw error;
    }
  }

  async getAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    try {
      const response = await this.request<WeatherAlert[]>('/alerts', {
        params: {
          lat: lat.toString(),
          lon: lon.toString()
        }
      });
      return response.data;
    } catch (error) {
      ErrorLogger.error('Failed to fetch weather alerts', error as Error);
      throw error;
    }
  }
}