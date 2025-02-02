import { cacheManager } from '@/lib/cache/cache-manager';
import { ErrorLogger } from '@/lib/errors/logger';

export type AgentState = 'idle' | 'processing' | 'error' | 'paused' | 'recovering';
export type AgentHealth = 'healthy' | 'degraded' | 'unhealthy';

interface AgentStateData {
  state: AgentState;
  health: AgentHealth;
  currentTask?: string;
  lastActive: string;
  errorCount: number;
  metrics: {
    successfulTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
    resourceUsage: {
      cpu: number;
      memory: number;
    };
  };
}

export class AgentStateManager {
  private readonly STATE_TTL = 3600; // 1 hour
  private readonly ERROR_THRESHOLD = 5;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.startHealthChecks();
  }

  async updateState(
    agentId: string,
    state: AgentState,
    taskId?: string
  ): Promise<void> {
    try {
      const currentState = await this.getState(agentId);
      const newState: AgentStateData = {
        ...currentState,
        state,
        currentTask: taskId,
        lastActive: new Date().toISOString()
      };

      await cacheManager.set(`agent:${agentId}:state`, newState, this.STATE_TTL);
    } catch (error) {
      ErrorLogger.error('Error updating agent state:', error as Error);
      throw error;
    }
  }

  async getState(agentId: string): Promise<AgentStateData> {
    try {
      const state = await cacheManager.get<AgentStateData>(`agent:${agentId}:state`);
      return state || this.getInitialState();
    } catch (error) {
      ErrorLogger.error('Error getting agent state:', error as Error);
      return this.getInitialState();
    }
  }

  async recordError(agentId: string, error: Error): Promise<void> {
    try {
      const state = await this.getState(agentId);
      state.errorCount++;
      state.health = this.determineHealth(state.errorCount);

      if (state.errorCount >= this.ERROR_THRESHOLD) {
        state.state = 'error';
        await this.triggerErrorRecovery(agentId);
      }

      await cacheManager.set(`agent:${agentId}:state`, state, this.STATE_TTL);
    } catch (error) {
      ErrorLogger.error('Error recording agent error:', error as Error);
    }
  }

  async recordTaskCompletion(
    agentId: string,
    success: boolean,
    processingTime: number
  ): Promise<void> {
    try {
      const state = await this.getState(agentId);
      
      if (success) {
        state.metrics.successfulTasks++;
      } else {
        state.metrics.failedTasks++;
      }

      // Update average processing time
      const totalTasks = state.metrics.successfulTasks + state.metrics.failedTasks;
      state.metrics.averageProcessingTime = 
        (state.metrics.averageProcessingTime * (totalTasks - 1) + processingTime) / totalTasks;

      await cacheManager.set(`agent:${agentId}:state`, state, this.STATE_TTL);
    } catch (error) {
      ErrorLogger.error('Error recording task completion:', error as Error);
    }
  }

  private async triggerErrorRecovery(agentId: string): Promise<void> {
    try {
      const state = await this.getState(agentId);
      state.state = 'recovering';
      await cacheManager.set(`agent:${agentId}:state`, state, this.STATE_TTL);

      // Implement recovery strategy
      await this.performRecoveryActions(agentId);
    } catch (error) {
      ErrorLogger.error('Error in error recovery:', error as Error);
    }
  }

  private async performRecoveryActions(agentId: string): Promise<void> {
    try {
      // 1. Pause current tasks
      await this.updateState(agentId, 'paused');

      // 2. Check resource usage
      const state = await this.getState(agentId);
      if (state.metrics.resourceUsage.cpu > 80 || state.metrics.resourceUsage.memory > 80) {
        await this.scaleResources(agentId);
      }

      // 3. Clear error count and reset health
      state.errorCount = 0;
      state.health = 'healthy';
      
      // 4. Resume agent
      state.state = 'idle';
      await cacheManager.set(`agent:${agentId}:state`, state, this.STATE_TTL);
    } catch (error) {
      ErrorLogger.error('Error performing recovery actions:', error as Error);
    }
  }

  private async scaleResources(agentId: string): Promise<void> {
    // Implement resource scaling logic
  }

  private determineHealth(errorCount: number): AgentHealth {
    if (errorCount >= this.ERROR_THRESHOLD) return 'unhealthy';
    if (errorCount >= this.ERROR_THRESHOLD / 2) return 'degraded';
    return 'healthy';
  }

  private getInitialState(): AgentStateData {
    return {
      state: 'idle',
      health: 'healthy',
      lastActive: new Date().toISOString(),
      errorCount: 0,
      metrics: {
        successfulTasks: 0,
        failedTasks: 0,
        averageProcessingTime: 0,
        resourceUsage: {
          cpu: 0,
          memory: 0
        }
      }
    };
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      try {
        // Implement periodic health checks
      } catch (error) {
        ErrorLogger.error('Error in health check:', error as Error);
      }
    }, this.HEALTH_CHECK_INTERVAL);
  }
}

export const agentStateManager = new AgentStateManager(); 