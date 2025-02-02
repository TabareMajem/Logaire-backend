import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxConcurrentTasks: number;
}

export class TaskRateLimiter {
  private readonly supabase = supabase;
  private readonly windowSizes = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000
  };

  private requests = {
    second: new Map<string, number>(),
    minute: new Map<string, number>(),
    hour: new Map<string, number>()
  };

  private lastReset = {
    second: Date.now(),
    minute: Date.now(),
    hour: Date.now()
  };

  async checkRateLimit(agentType: string): Promise<void> {
    try {
      // Get rate limit config
      const config = await this.getRateLimitConfig(agentType);

      // Reset counters if needed
      this.resetCountersIfNeeded();

      // Check limits
      await this.checkLimits(agentType, config);

      // Increment counters
      this.incrementCounters(agentType);
    } catch (error) {
      ErrorLogger.error('Rate limit check failed', error as Error);
      throw error;
    }
  }

  private async getRateLimitConfig(agentType: string): Promise<RateLimitConfig> {
    const { data, error } = await this.supabase
      .from('rate_limit_configs')
      .select('*')
      .eq('agent_type', agentType)
      .single();

    if (error) throw error;
    return data;
  }

  private resetCountersIfNeeded(): void {
    const now = Date.now();

    for (const [window, lastReset] of Object.entries(this.lastReset)) {
      if (now - lastReset >= this.windowSizes[window as keyof typeof this.windowSizes]) {
        this.requests[window as keyof typeof this.requests].clear();
        this.lastReset[window as keyof typeof this.lastReset] = now;
      }
    }
  }

  private async checkLimits(agentType: string, config: RateLimitConfig): Promise<void> {
    const current = {
      second: this.requests.second.get(agentType) || 0,
      minute: this.requests.minute.get(agentType) || 0,
      hour: this.requests.hour.get(agentType) || 0
    };

    if (current.second >= config.maxRequestsPerSecond) {
      throw new Error('Rate limit exceeded (per second)');
    }

    if (current.minute >= config.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded (per minute)');
    }

    if (current.hour >= config.maxRequestsPerHour) {
      throw new Error('Rate limit exceeded (per hour)');
    }
  }

  private incrementCounters(agentType: string): void {
    for (const window of Object.keys(this.requests)) {
      const counter = this.requests[window as keyof typeof this.requests];
      counter.set(agentType, (counter.get(agentType) || 0) + 1);
    }
  }
}