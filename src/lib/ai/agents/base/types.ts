
export interface AgentTask {
  type: string;
  input: Record<string, any>;
  requirements?: {
    minConfidence?: number;
    maxLatency?: number;
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface ExecutionContext {
  task: AgentTask;
  model: string;
  prompt: string;
  result: AgentResult & {
    duration: number;
  };
  timestamp: Date;
}

export interface AgentCapability {
  name: string;
  description: string;
  requiredData: string[];
  outputSchema?: Record<string, any>;
  examples?: Array<{
    input: Record<string, any>;
    output: Record<string, any>;
  }>;
}

export interface LearningRecord {
  taskType: string;
  model: string;
  success: boolean;
  confidence: number;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentMetrics {
  requestCount: number;
  successRate: number;
  averageLatency: number;
  averageConfidence: number;
  errorRate: number;
}