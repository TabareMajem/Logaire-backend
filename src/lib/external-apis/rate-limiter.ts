interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
}

interface RateLimitState {
  count: number;
  timestamp: number;
}

export class RateLimiter {
  private secondState: RateLimitState = { count: 0, timestamp: Date.now() };
  private minuteState: RateLimitState = { count: 0, timestamp: Date.now() };
  private hourState: RateLimitState = { count: 0, timestamp: Date.now() };

  constructor(private config: RateLimitConfig) {}

  async checkRateLimit(): Promise<void> {
    this.resetCountersIfNeeded();

    if (this.isLimitExceeded()) {
      throw new Error('Rate limit exceeded');
    }

    this.incrementCounters();
  }

  private resetCountersIfNeeded(): void {
    const now = Date.now();

    if (now - this.secondState.timestamp >= 1000) {
      this.secondState = { count: 0, timestamp: now };
    }
    if (now - this.minuteState.timestamp >= 60000) {
      this.minuteState = { count: 0, timestamp: now };
    }
    if (now - this.hourState.timestamp >= 3600000) {
      this.hourState = { count: 0, timestamp: now };
    }
  }

  private isLimitExceeded(): boolean {
    return (
      this.secondState.count >= this.config.requestsPerSecond ||
      this.minuteState.count >= this.config.requestsPerMinute ||
      this.hourState.count >= this.config.requestsPerHour
    );
  }

  private incrementCounters(): void {
    this.secondState.count++;
    this.minuteState.count++;
    this.hourState.count++;
  }
}