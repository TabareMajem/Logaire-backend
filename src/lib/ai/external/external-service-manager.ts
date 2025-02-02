import { AnthropicClient } from './anthropic-client';
import { ErrorLogger } from '@/lib/errors/logger';

interface ExternalServiceConfig {
  type: 'anthropic';
  config: Record<string, any>;
}

export class ExternalServiceManager {
  private services: Map<string, any> = new Map();

  constructor(configs: ExternalServiceConfig[]) {
    this.initializeServices(configs);
  }

  private initializeServices(configs: ExternalServiceConfig[]): void {
    for (const config of configs) {
      try {
        switch (config.type) {
          case 'anthropic':
            this.services.set('anthropic', new AnthropicClient());
            break;
          default:
            throw new Error(`Unknown service type: ${config.type}`);
        }
      } catch (error) {
        ErrorLogger.error(`Failed to initialize ${config.type} service`, error as Error);
      }
    }
  }

  getService<T>(type: string): T {
    const service = this.services.get(type);
    if (!service) {
      throw new Error(`Service not found: ${type}`);
    }
    return service as T;
  }

  async executeWithFallback<T>(
    primaryService: string,
    fallbackService: string,
    operation: (service: any) => Promise<T>
  ): Promise<T> {
    try {
      const service = this.getService(primaryService);
      return await operation(service);
    } catch (error) {
      ErrorLogger.error(`Primary service ${primaryService} failed`, error as Error);
      try {
        const fallback = this.getService(fallbackService);
        return await operation(fallback);
      } catch (fallbackError) {
        ErrorLogger.error(`Fallback service ${fallbackService} failed`, fallbackError as Error);
        throw fallbackError;
      }
    }
  }
}