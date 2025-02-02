import { ErrorLogger } from '@/lib/errors/logger';
import { metricsService } from '@/services/metrics-service';
import { EventEmitter } from 'events';
import { BaseAgent } from '../agents/base/base-agent';

interface CollaborationMessage {
  type: 'request' | 'response' | 'broadcast';
  from: string;
  to?: string;
  content: any;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface CollaborationConfig {
  maxParallelAgents: number;
  timeoutMs: number;
  retryAttempts: number;
}

export class CollaborationManager extends EventEmitter {
  private agents: Map<string, BaseAgent>;
  private messageQueue: CollaborationMessage[];
  private config: CollaborationConfig;
  private processing: boolean;

  constructor(config: CollaborationConfig) {
    super();
    this.agents = new Map();
    this.messageQueue = [];
    this.config = config;
    this.processing = false;
  }

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
    
    // Listen for agent messages
    agent.on('message', (message: any) => {
      this.handleAgentMessage(agent.id, message);
    });
  }

  async sendMessage(message: Omit<CollaborationMessage, 'timestamp'>): Promise<void> {
    const fullMessage: CollaborationMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    this.messageQueue.push(fullMessage);
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.messageQueue.length === 0) return;

    this.processing = true;
    const startTime = Date.now();

    try {
      const batch = this.messageQueue.splice(0, this.config.maxParallelAgents);
      const promises = batch.map(message => this.deliverMessage(message));

      await Promise.all(promises);

      // Record metrics
      await metricsService.insertMetrics([{
        type: 'collaboration_batch',
        value: Date.now() - startTime,
        metadata: {
          messageCount: batch.length,
          successCount: promises.length
        }
      }]);
    } catch (error) {
      ErrorLogger.error('Error processing message queue:', error as Error);
    } finally {
      this.processing = false;
      if (this.messageQueue.length > 0) {
        await this.processQueue();
      }
    }
  }

  private async deliverMessage(message: CollaborationMessage): Promise<void> {
    const startTime = Date.now();
    let attempts = 0;

    while (attempts < this.config.retryAttempts) {
      try {
        if (message.type === 'broadcast') {
          await this.broadcastMessage(message);
        } else {
          await this.deliverDirectMessage(message);
        }

        // Record success metrics
        await metricsService.insertMetrics([{
          type: 'message_delivery',
          value: Date.now() - startTime,
          metadata: {
            type: message.type,
            from: message.from,
            to: message.to,
            attempts
          }
        }]);

        return;
      } catch (error) {
        attempts++;
        if (attempts === this.config.retryAttempts) {
          ErrorLogger.error('Message delivery failed:', error as Error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  private async deliverDirectMessage(message: CollaborationMessage): Promise<void> {
    if (!message.to) {
      throw new Error('Direct message must have a recipient');
    }

    const targetAgent = this.agents.get(message.to);
    if (!targetAgent) {
      throw new Error(`Agent ${message.to} not found`);
    }

    await this.validateMessage(message);
    await targetAgent.onMessage(message);
  }

  private async broadcastMessage(message: CollaborationMessage): Promise<void> {
    const promises = Array.from(this.agents.values())
      .filter(agent => agent.id !== message.from)
      .map(agent => agent.onMessage(message));

    await Promise.all(promises);
  }

  private async validateMessage(message: CollaborationMessage): Promise<void> {
    if (!message.from || !this.agents.has(message.from)) {
      throw new Error(`Invalid sender: ${message.from}`);
    }

    if (message.type === 'request' || message.type === 'response') {
      if (!message.to || !this.agents.has(message.to)) {
        throw new Error(`Invalid recipient: ${message.to}`);
      }
    }

    if (!message.content) {
      throw new Error('Message content is required');
    }
  }

  getActiveAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  async getAgentStatus(agentId: string): Promise<Record<string, any> | null> {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    return {
      id: agent.id,
      type: agent.type,
      status: agent.isRunning ? 'active' : 'inactive',
      messageCount: this.messageQueue.filter(m => 
        m.from === agentId || m.to === agentId
      ).length
    };
  }

  clearQueue(): void {
    this.messageQueue = [];
  }
} 