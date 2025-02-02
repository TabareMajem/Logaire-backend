export interface AIContext {
  userId?: string;
  timestamp: Date;
  preferences?: Record<string, any>;
}

export interface AIResponse<T> {
  data: T;
  confidence: number;
  reasoning: string[];
}

export interface ProcessingRule {
  id: string;
  type: 'validation' | 'transformation' | 'enrichment';
  condition: (data: any) => boolean;
  action: (data: any) => Promise<any>;
}

export interface ProcessingPipeline {
  name: string;
  rules: ProcessingRule[];
  fallback?: (error: Error) => Promise<any>;
}