import { AI_RATE_LIMITS } from '../config/constants';
import { ErrorLogger } from '@/lib/errors/logger';
import { AIError } from '../utils/error-handler';

interface RateLimitState {
  requests: number;
  timestamp: number;
}

export class RateLimiter {
  private minuteState: RateLimitState = { requests: 0, timestamp: Date.now() };
  private hourState: RateLimitState = { requests: 0, timestamp: Date.now() };

  async checkRateLimit(): Promise<void> {
    try {
      this.resetCountersIfNeeded();
      
      if (this.minuteState.requests >= AI_RATE_LIMITS.REQUESTS_PER_MINUTE) {
        throw new AIError('Rate limit exceeded (per minute)', 'RATE_LIMIT');
      }

      if (this.hourState.requests >= AI_RATE_LIMITS.REQUESTS_PER_HOUR) {
        throw new AIError('Rate limit exceeded (per hour)', 'RATE_LIMIT');
      }

      this.incrementCounters();
    } catch (error) {
      ErrorLogger.error('Rate limit check failed', error as Error);
      throw error;
    }
  }

  private resetCountersIfNeeded(): void {
    const now = Date.now();
    
    if (now - this.minuteState.timestamp >= 60000) {
      this.minuteState = { requests: 0, timestamp: now };
    }
    
    if (now - this.hourState.timestamp >= 3600000) {
      this.hourState = { requests: 0, timestamp: now };
    }
  }

  private incrementCounters(): void {
    this.minuteState.requests++;
    this.hourState.requests++;
  }
}