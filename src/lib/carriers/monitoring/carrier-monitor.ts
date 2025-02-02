done done

import { supabase } from '@/lib/supabase/client';
import { CarrierConfig } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

interface CarrierHealthStatus {
  carrier: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  metrics: {
    latency: number;
    successRate: number;
    errorRate: number;
  };
  error?: string;
}

interface EndpointStatus {
  endpoint: string;
  latency: number;
  success: boolean;
  error?: string;
}

export class CarrierMonitor {
  private readonly supabase = supabase;;

  async checkCarrierHealth(): Promise<CarrierHealthStatus[]> {
    try {
      const carriers = await this.getActiveCarriers();
      
      return Promise.all(
        carriers.map(async carrier => {
          try {
            const status = await this.checkCarrierEndpoints(carrier);
            const metrics = this.calculateMetrics(status);
            
            return {
              carrier: carrier.code,
              status: this.determineOverallStatus(metrics),
              lastCheck: new Date(),
              metrics
            };
          } catch (error) {
            ErrorLogger.error(`Health check failed for carrier ${carrier.code}`, error as Error);
            return {
              carrier: carrier.code,
              status: 'down',
              lastCheck: new Date(),
              metrics: { latency: -1, successRate: 0, errorRate: 1 },
              error: (error as Error).message
            };
          }
        })
      );
    } catch (error) {
      ErrorLogger.error('Failed to check carrier health', error as Error);
      throw error;
    }
  }

  private async getActiveCarriers(): Promise<CarrierConfig[]> {
    const { data, error } = await this.supabase
      .from('carrier_configurations')
      .select('*')
      .eq('active', true);

    if (error) throw error;
    return data;
  }

  private async checkCarrierEndpoints(carrier: CarrierConfig): Promise<EndpointStatus[]> {
    const endpoints = [
      { path: '/rates', method: 'GET' },
      { path: '/tracking', method: 'GET' },
      { path: '/booking', method: 'POST' }
    ];

    return Promise.all(
      endpoints.map(async ({ path, method }) => {
        const start = Date.now();
        try {
          const response = await fetch(`${carrier.apiCredentials.endpoint}${path}`, {
            method,
            headers: this.getAuthHeaders(carrier)
          });

          return {
            endpoint: path,
            latency: Date.now() - start,
            success: response.ok,
            error: response.ok ? undefined : response.statusText
          };
        } catch (error) {
          return {
            endpoint: path,
            latency: Date.now() - start,
            success: false,
            error: (error as Error).message
          };
        }
      })
    );
  }

  private calculateMetrics(statuses: EndpointStatus[]): CarrierHealthStatus['metrics'] {
    const totalEndpoints = statuses.length;
    const successfulEndpoints = statuses.filter(s => s.success).length;
    const averageLatency = statuses.reduce((sum, s) => sum + s.latency, 0) / totalEndpoints;

    return {
      latency: averageLatency,
      successRate: successfulEndpoints / totalEndpoints,
      errorRate: (totalEndpoints - successfulEndpoints) / totalEndpoints
    };
  }

  private determineOverallStatus(metrics: CarrierHealthStatus['metrics']): CarrierHealthStatus['status'] {
    if (metrics.errorRate >= 0.5) return 'down';
    if (metrics.errorRate > 0 || metrics.latency > 2000) return 'degraded';
    return 'healthy';
  }

  private getAuthHeaders(carrier: CarrierConfig): Record<string, string> {
    const { apiKey, clientId, clientSecret } = carrier.apiCredentials;
    
    if (apiKey) {
      return { Authorization: `Bearer ${apiKey}` };
    }

    if (clientId && clientSecret) {
      return {
        'X-Client-Id': clientId,
        'X-Client-Secret': clientSecret
      };
    }

    throw new Error('Missing authentication credentials');
  }
}