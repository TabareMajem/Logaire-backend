import { ErrorLogger } from '@/lib/errors/logger';
import { metricsService } from '@/services/metrics-service';
import { BaseAgent } from './base/base-agent';

interface AgentPerformanceMetrics {
  responseTime: number[];
  errorCount: number;
  totalCalls: number;
  successRate: number;
  lastUpdated: string;
  resourceUsage: {
    cpu: number;
    memory: number;
    tokens: number;
  };
}

export class AgentPerformanceTracker {
  private static instance: AgentPerformanceTracker;
  private metrics: Map<string, AgentPerformanceMetrics>;
  private readonly METRICS_WINDOW = 100; // Keep last 100 measurements
  private readonly UPDATE_INTERVAL = 60000; // Update every minute

  private constructor() {
    this.metrics = new Map();
    this.startPeriodicUpdate();
  }

  static getInstance(): AgentPerformanceTracker {
    if (!this.instance) {
      this.instance = new AgentPerformanceTracker();
    }
    return this.instance;
  }

  trackAgentCall(
    agent: BaseAgent,
    startTime: number,
    success: boolean,
    resourceUsage?: {
      cpu?: number;
      memory?: number;
      tokens?: number;
    }
  ): void {
    try {
      const agentMetrics = this.getOrCreateMetrics(agent.id);
      const responseTime = Date.now() - startTime;

      // Update response times
      agentMetrics.responseTime.push(responseTime);
      if (agentMetrics.responseTime.length > this.METRICS_WINDOW) {
        agentMetrics.responseTime.shift();
      }

      // Update counts
      agentMetrics.totalCalls++;
      if (!success) {
        agentMetrics.errorCount++;
      }

      // Update success rate
      agentMetrics.successRate = 
        (agentMetrics.totalCalls - agentMetrics.errorCount) / 
        agentMetrics.totalCalls;

      // Update resource usage if provided
      if (resourceUsage) {
        if (resourceUsage.cpu) {
          agentMetrics.resourceUsage.cpu = resourceUsage.cpu;
        }
        if (resourceUsage.memory) {
          agentMetrics.resourceUsage.memory = resourceUsage.memory;
        }
        if (resourceUsage.tokens) {
          agentMetrics.resourceUsage.tokens = resourceUsage.tokens;
        }
      }

      agentMetrics.lastUpdated = new Date().toISOString();
      this.metrics.set(agent.id, agentMetrics);
    } catch (error) {
      ErrorLogger.error('Error tracking agent call:', error as Error);
    }
  }

  getAgentMetrics(agentId: string): AgentPerformanceMetrics | null {
    return this.metrics.get(agentId) || null;
  }

  getAllAgentMetrics(): Map<string, AgentPerformanceMetrics> {
    return new Map(this.metrics);
  }

  private getOrCreateMetrics(agentId: string): AgentPerformanceMetrics {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, {
        responseTime: [],
        errorCount: 0,
        totalCalls: 0,
        successRate: 1,
        lastUpdated: new Date().toISOString(),
        resourceUsage: {
          cpu: 0,
          memory: 0,
          tokens: 0
        }
      });
    }
    return this.metrics.get(agentId)!;
  }

  private startPeriodicUpdate(): void {
    setInterval(() => this.updateMetrics(), this.UPDATE_INTERVAL);
  }

  private async updateMetrics(): Promise<void> {
    try {
      const metricsArray = Array.from(this.metrics.entries()).map(
        ([agentId, metrics]) => ({
          type: 'agent_performance',
          agentId,
          value: this.calculateAverageResponseTime(metrics.responseTime),
          metadata: {
            errorCount: metrics.errorCount,
            totalCalls: metrics.totalCalls,
            successRate: metrics.successRate,
            resourceUsage: metrics.resourceUsage,
            timestamp: new Date().toISOString()
          }
        })
      );

      await metricsService.insertMetrics(metricsArray);
    } catch (error) {
      ErrorLogger.error('Error updating agent metrics:', error as Error);
    }
  }

  private calculateAverageResponseTime(responseTimes: number[]): number {
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const agentPerformanceTracker = AgentPerformanceTracker.getInstance(); 