done done

import { CargoAIConfig, CargoAIQuoteRequest, CargoAIRate } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export class CargoAIClient {
  private config: CargoAIConfig;
  private authToken: string | null = null;

  constructor(config: CargoAIConfig) {
    this.config = config;
  }

  async searchRates(request: CargoAIQuoteRequest): Promise<CargoAIRate[]> {
    try {
      const response = await this.request<{ rates: CargoAIRate[] }>(
        '/quotes/search',
        {
          method: 'POST',
          body: JSON.stringify(request)
        }
      );

      return response.rates;
    } catch (error) {
      ErrorLogger.error('Failed to search CargoAI rates', error as Error);
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.config.baseUrl}${endpoint}`,
      {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CargoAI API error: ${response.status}`);
    }

    return response.json();
  }

  private async getAuthToken(): Promise<string> {
    if (this.authToken) return this.authToken;

    const response = await fetch(
      `${this.config.baseUrl}/auth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          apiSecret: this.config.apiSecret
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to obtain CargoAI auth token');
    }

    const data = await response.json();
    this.authToken = data.token;
    return this.authToken;
  }
}