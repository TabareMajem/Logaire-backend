export type AgentType = 'document' | 'routing' | 'rate' | 'customer-service';

export interface AgentConfig {
  id?: string;
  name: string;
  type: AgentType;
  description?: string;
  enabled: boolean;
  model: string;
  temperature?: number;
  maxTokens?: number;
  options?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AgentStatus {
  id: string;
  status: 'idle' | 'processing' | 'error';
  lastActive: string;
  errorMessage?: string;
  performance?: {
    requestsProcessed: number;
    averageLatency: number;
    errorRate: number;
  };
}

export interface AgentMetrics {
  requestsPerMinute: number[];
  latencies: number[];
  errorRates: number[];
  timestamps: string[];
} 