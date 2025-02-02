import { CarrierConfig, RateRequest, Rate, BookingRequest, BookingConfirmation } from './types';
import { RateCache } from './cache';
import { CarrierError } from './errors';
import { TrackingUpdate } from './types/tracking';
import { Schedule, ScheduleRequest } from './types/schedule';

export abstract class BaseCarrier {
  protected config: CarrierConfig;
  protected cache: Cache;

  constructor(config: CarrierConfig) {
    this.config = config;
    this.cache = new Cache();
    this.validateConfig();
  }

  abstract getRates(request: RateRequest): Promise<Rate[]>;
  abstract createBooking(booking: BookingRequest): Promise<BookingConfirmation>;
  abstract trackShipment(reference: string): Promise<TrackingUpdate[]>;
  abstract getSchedules(request: ScheduleRequest): Promise<Schedule[]>;

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(
        `${this.config.apiCredentials.endpoint}${endpoint}`,
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
        throw CarrierError.apiError(response, {
          carrier: this.config.code,
          endpoint,
        });
      }

      return response.json();
    } catch (error) {
      throw CarrierError.connectionError(this.config.code, error as Error);
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    const { apiKey, clientId, clientSecret } = this.config.apiCredentials;

    if (apiKey) {
      return { Authorization: `Bearer ${apiKey}` };
    }

    if (clientId && clientSecret) {
      return {
        'X-Client-Id': clientId,
        'X-Client-Secret': clientSecret,
      };
    }

    throw CarrierError.validationError(
      'Missing authentication credentials',
      this.config.code
    );
  }

  private validateConfig() {
    const { apiCredentials } = this.config;
    
    if (!apiCredentials.endpoint) {
      throw CarrierError.validationError(
        'Missing API endpoint',
        this.config.code
      );
    }

    if (!apiCredentials.apiKey && !(apiCredentials.clientId && apiCredentials.clientSecret)) {
      throw CarrierError.validationError(
        'Missing authentication credentials',
        this.config.code
      );
    }
  }
}