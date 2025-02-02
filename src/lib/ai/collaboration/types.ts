import { BaseAgent } from '../agents/base/base-agent';

export type MessageType = 'request' | 'response' | 'broadcast' | 'error' | 'status';
export type MessagePriority = 'low' | 'medium' | 'high' | 'critical';

export interface CollaborationMessage {
  timestamp: string | number | Date;
  id: string;
  type: MessageType;
  priority: MessagePriority;
  from: string;
  to?: string;
  content: any;
  context?: Record<string, any>;
  metadata: {
    timestamp: string;
    correlationId?: string;
    workflow?: {
      id: string;
      step: string;
    };
    retry?: {
      count: number;
      maxAttempts: number;
    };
  };
}

export interface CollaborativeAgent extends BaseAgent {
  onMessage(message: CollaborationMessage): Promise<void>;
  sendMessage(message: Omit<CollaborationMessage, 'id' | 'from' | 'metadata'>): Promise<void>;
  broadcast(content: any, priority?: MessagePriority): Promise<void>;
  getCollaborationStatus(): Promise<{
    isAvailable: boolean;
    currentLoad: number;
    capabilities: string[];
  }>;
}

export interface CollaborationMetrics {
  messageCount: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  activeCollaborations: number;
} 