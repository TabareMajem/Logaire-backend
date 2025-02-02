export interface AgentExperience {
  id: string;
  agentType: string;
  taskType: string;
  input: Record<string, any>;
  output: Record<string, any>;
  duration: number;
  resourceUsage: number;
  success: boolean;
  accuracy: number;
  quality: number;
  impact: number;
  timestamp: Date;
}

export interface AgentExecution {
  id: string;
  duration: number; 
  resourceUsage: number; 
  accuracy: number; 
  success: boolean; 
  quality: number; 
  impact: number; 
}

export interface FeedbackSource {
  score: number;
  aspects: Record<string, any>;
  comments?: string[];
}

export interface Feedback {
  executionId: string;
  timestamp: Date;
  sources: {
    user: FeedbackSource;
    system: FeedbackSource;
    outcome: FeedbackSource;
  };
  aggregateScore: number;
}

export interface PerformancePattern {
  type: string;
  frequency: number;
  score: number;
  factors: string[];
}

export interface LearningInsights {
  patterns: PerformancePattern[];
  trends: Record<string, number>;
  improvements: string[];
  confidence: number;
  timestamp: Date;
}

export interface StrategyUpdate {
  changes: Array<{
    parameter: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  confidence: number;
  timestamp: Date;
}