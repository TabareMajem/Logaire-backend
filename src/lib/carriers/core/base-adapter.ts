import { CarrierAdapter, CarrierConfig, CarrierResponse } from './types';
import { CarrierError } from '../errors';
import { ErrorLogger } from '@/lib/errors/logger';
import { BookingConfirmation, BookingRequest, Rate, RateRequest } from '../types';
import { Schedule, ScheduleRequest } from '../types/schedule';
import { TrackingUpdate } from '../types/tracking';

export abstract class BaseCarrierAdapter implements CarrierAdapter {
  protected config: CarrierConfig;

  constructor(config: CarrierConfig) {
    this.config = config;
    this.validateConfig();
  }

  abstract getRates(request: RateRequest): Promise<Rate[]>;
  abstract createBooking(request: BookingRequest): Promise<BookingConfirmation>;
  abstract trackShipment(reference: string): Promise<TrackingUpdate[]>;
  abstract getSchedules(request: ScheduleRequest): Promise<Schedule[]>;

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CarrierResponse<T>> {
    try {
      const response = await fetch(
        `${this.config.endpoints[endpoint as keyof typeof this.config.endpoints]}`,
        {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        }
      );

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return { data, raw: data };
    } catch (error) {
      ErrorLogger.error(`Carrier API request failed: ${endpoint}`, error as Error);
      throw error;
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    const { credentials } = this.config;

    if (credentials.apiKey) {
      return { Authorization: `Bearer ${credentials.apiKey}` };
    }

    if (credentials.username && credentials.password) {
      return {
        Authorization: `Basic ${Buffer.from(
          `${credentials.username}:${credentials.password}`
        ).toString('base64')}`
      };
    }

    if (credentials.clientId && credentials.clientSecret) {
      return {
        'X-Client-Id': credentials.clientId,
        'X-Client-Secret': credentials.clientSecret,
      };
    }

    throw new CarrierError(
      'No valid authentication credentials found',
      'AUTH_ERROR',
      this.config.id
    );
  }

  private validateConfig(): void {
    if (!this.config.id || !this.config.name) {
      throw new CarrierError(
        'Invalid carrier configuration',
        'CONFIG_ERROR',
        this.config.id
      );
    }

    if (!this.config.endpoints || !Object.values(this.config.endpoints).every(Boolean)) {
      throw new CarrierError(
        'Missing required endpoints',
        'CONFIG_ERROR',
        this.config.id
      );
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    throw new CarrierError(
      errorData.message || 'Carrier API request failed',
      'API_ERROR',
      this.config.id,
      {
        status: response.status,
        data: errorData
      }
    );
  }
}