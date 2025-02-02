done done

import { ExternalAPIConfig, APIResponse, APIError, RequestOptions } from './types';
import { Cache } from './cache';
import { RetryHandler } from './retry-handler';
import { ErrorLogger } from '@/lib/errors/logger';

export abstract class BaseExternalClient {
  protected config: ExternalAPIConfig;
  protected cache: Cache;

  constructor(config: ExternalAPIConfig) {
    this.config = config;
    this.cache = new Cache();
  }

  protected async request<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const cacheKey = this.generateCacheKey(endpoint, options);
    
    if (options?.cache !== false) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached as APIResponse<T>;
      }
    }

    try {
      const response = await RetryHandler.withRetry(
        () => this.makeRequest(endpoint, options),
        this.constructor.name
      );

      const data = await this.processResponse<T>(response);
      
      if (options?.cache !== false) {
        await this.cache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      throw this.handleError(error, endpoint);
    }
  }

  private async makeRequest(
    endpoint: string,
    options?: RequestOptions
  ): Promise<Response> {
    const url = this.buildUrl(endpoint, options?.params);
    const controller = new AbortController();
    const timeout = options?.timeout ?? this.config.timeout;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await this.createAPIError(response);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async processResponse<T>(response: Response): Promise<APIResponse<T>> {
    const data = await response.json();
    return {
      data,
      timestamp: new Date(),
      source: this.constructor.name,
      reliability: this.calculateReliability(response)
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.config.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private generateCacheKey(endpoint: string, options?: RequestOptions): string {
    return `${this.constructor.name}:${endpoint}:${JSON.stringify(options)}`;
  }

  private calculateReliability(response: Response): number {
    // Implement reliability calculation based on response metrics
    return 1.0;
  }

  private async createAPIError(response: Response): Promise<APIError> {
    try {
      const error = await response.json();
      return {
        code: error.code || response.status.toString(),
        message: error.message || response.statusText,
        details: error,
        source: this.constructor.name,
        timestamp: new Date()
      };
    } catch {
      return {
        code: response.status.toString(),
        message: response.statusText,
        source: this.constructor.name,
        timestamp: new Date()
      };
    }
  }

  private handleError(error: unknown, endpoint: string): never {
    ErrorLogger.error('External API request failed', error as Error, {
      client: this.constructor.name,
      endpoint
    });
    throw error;
  }
}