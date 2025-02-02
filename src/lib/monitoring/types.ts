export interface AgentMetrics {
  avgResponseTime: ReactNode;
  agentType: string;
  successRate: number;
  averageDuration: number;
  costPerRequest: number;
  requestsPerMinute: number;
  errorRate: number;
  modelUsage: {
    modelId: string;
    tokensUsed: number;
    cost: number;
  }[];
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeAgents: number;
  queuedTasks: number;
  activeConnections: number;
}

export interface AlertConfig {
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  severity: 'low' | 'medium' | 'high';
} 