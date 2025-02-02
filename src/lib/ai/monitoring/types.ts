export interface AgentMetrics {
  successRate: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
  resourceUsage: {
    memory: number;
    cpu: number;
  };
}

export interface MetricsRecord {
  agentType: string;
  taskType: string;
  duration: number;
  success: boolean;
  confidence: number;
  memory: number;
  cpu: number;
  error?: string;
}

export interface PerformanceThresholds {
  maxLatency: number;
  minSuccessRate: number;
  maxErrorRate: number;
  maxMemoryUsage: number;
  maxCpuUsage: number;
}

export interface MetricsTimeframe {
  start: Date;
  end: Date;
}