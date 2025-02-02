import { ErrorLogger } from '@/lib/errors/logger';
import { BaseAgent, BaseAgentConfig } from './base/base-agent';
import { LearningManager } from './base/learning-manager';
import { ModelSelector } from './base/model-selector';

interface EnhancedAgentConfig extends BaseAgentConfig {
  learningEnabled?: boolean;
  modelSelection?: boolean;
  retryOptions?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export class EnhancedAgent extends BaseAgent {
  private learningManager?: LearningManager;
  private modelSelector?: ModelSelector;
  private retryCount: number = 0;

  constructor(config: EnhancedAgentConfig) {
    super(config);
    
    if (config.learningEnabled) {
      this.learningManager = new LearningManager(this.getId());
    }
    
    if (config.modelSelection) {
      this.modelSelector = new ModelSelector();
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      if (this.learningManager) {
        await this.learningManager.initialize();
      }

      this.isRunning = true;
      this.emit('started', { agentId: this.getId() });
    } catch (error) {
      ErrorLogger.error(`Enhanced agent ${this.getId()} failed to start:`, error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      if (this.learningManager) {
        await this.learningManager.save();
      }

      this.isRunning = false;
      this.emit('stopped', { agentId: this.getId() });
    } catch (error) {
      ErrorLogger.error(`Enhanced agent ${this.getId()} failed to stop:`, error as Error);
      throw error;
    }
  }

  async onMessage(message: any): Promise<void> {
    try {
      if (!this.isRunning) {
        throw new Error('Agent is not running');
      }

      // Select appropriate model if enabled
      if (this.modelSelector) {
        const model = await this.modelSelector.selectModel(message);
        message.model = model;
      }

      // Process message with learning if enabled
      if (this.learningManager) {
        const enhancedMessage = await this.learningManager.enhance(message);
        await this.processMessage(enhancedMessage);
        await this.learningManager.learn(message, 'success');
      } else {
        await this.processMessage(message);
      }

      this.retryCount = 0;
    } catch (error) {
      await this.handleError(error as Error, message);
    }
  }

  private async processMessage(message: any): Promise<void> {
    // Implementation specific to the agent type
    this.emit('processed', { agentId: this.getId(), message });
  }

  private async handleError(error: Error, message: any): Promise<void> {
    const retryOptions = (this.config as EnhancedAgentConfig).retryOptions;
    
    if (retryOptions && this.retryCount < retryOptions.maxAttempts) {
      this.retryCount++;
      const delay = retryOptions.backoffMs * Math.pow(2, this.retryCount - 1);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      await this.onMessage(message);
    } else {
      if (this.learningManager) {
        await this.learningManager.learn(message, 'error');
      }
      
      ErrorLogger.error(`Enhanced agent ${this.getId()} message processing failed:`, error);
      this.emitError(error);
    }
  }

  getEnhancedStatus(): {
    isRunning: boolean;
    learningEnabled: boolean;
    modelSelectionEnabled: boolean;
    retryCount: number;
  } {
    return {
      ...this.getStatus(),
      learningEnabled: !!this.learningManager,
      modelSelectionEnabled: !!this.modelSelector,
      retryCount: this.retryCount
    };
  }
} 