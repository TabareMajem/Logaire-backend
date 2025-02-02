interface RateLimitConfig {
  maxRequests: number;
  interval: number;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

export class RateLimiter {
  private requests = new Map<string, RequestRecord>();

  constructor(private config: RateLimitConfig) {}

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now - record.timestamp >= this.config.interval) {
      this.requests.set(key, { timestamp: now, count: 1 });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  async resetLimit(key: string): Promise<void> {
    this.requests.delete(key);
  }

  async getRemainingRequests(key: string): Promise<number> {
    const record = this.requests.get(key);
    
    if (!record || Date.now() - record.timestamp >= this.config.interval) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  async getTimeUntilReset(key: string): Promise<number> {
    const record = this.requests.get(key);
    
    if (!record) {
      return 0;
    }

    const timeElapsed = Date.now() - record.timestamp;
    return Math.max(0, this.config.interval - timeElapsed);
  }
}