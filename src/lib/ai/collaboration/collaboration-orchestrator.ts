import { AlertManager } from '@/lib/monitoring/alerts/alert-manager';
import { WorkflowAlertMonitor } from '@/lib/monitoring/alerts/workflow-alerts';
import { EventEmitter } from 'events';
import { agentPerformanceTracker } from '../agents/performance-tracker';
import { workflowAnalytics } from '../analytics/workflow-analytics';
import { CollaborationManager } from './collaboration-manager';
import { CollaborationMessage, CollaborativeAgent } from './types';
import { Agent } from '@/hooks/useAgents';

interface CollaborationEvent {
  type: 'agent_joined' | 'agent_left' | 'message_sent' | 'task_completed' | 'error';
  agentId: string;
  timestamp: string;
  data?: any;
}

export class CollaborationOrchestrator extends EventEmitter {
  private collaborationManager: CollaborationManager;
  private alertMonitor: WorkflowAlertMonitor;
  private activeCollaborations: Map<string, Set<string>>; // workflowId -> Set of agentIds
  private taskAssignments: Map<string, string[]>; // agentId -> assigned taskIds

  constructor() {
    super();
    this.collaborationManager = new CollaborationManager({
      maxParallelAgents: 10,
      timeoutMs: 30000,
      retryAttempts: 3
    });
    this.alertMonitor = new WorkflowAlertMonitor(new AlertManager());
    this.activeCollaborations = new Map();
    this.taskAssignments = new Map();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.on('agent_joined', this.handleAgentJoined.bind(this));
    this.on('message_sent', this.handleMessageSent.bind(this));
    this.on('task_completed', this.handleTaskCompleted.bind(this));
    this.on('error', this.handleError.bind(this));
  }

  async registerAgentForWorkflow(
    agent: CollaborativeAgent,
    workflowId: string
  ): Promise<void> {
    this.collaborationManager.registerAgent(agent);
    
    let agents = this.activeCollaborations.get(workflowId) || new Set();
    agents.add(agent.id);
    this.activeCollaborations.set(workflowId, agents);

    this.emit('agent_joined', {
      type: 'agent_joined',
      agentId: agent.id,
      timestamp: new Date().toISOString(),
      data: { workflowId }
    });
  }

  async initiateCollaboration(
    workflowId: string,
    initiatorId: string,
    targetAgents: string[],
    task: any
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Assign tasks to agents
      targetAgents.forEach(agentId => {
        const tasks = this.taskAssignments.get(agentId) || [];
        tasks.push(task.id);
        this.taskAssignments.set(agentId, tasks);
      });

      // Send collaboration request
      await this.collaborationManager.sendMessage({
        type: 'request',
        from: initiatorId,
        content: task,
        priority: 'high',
        metadata: {
          workflowId,
          collaborators: targetAgents
        }
      });

      // Track performance
      agentPerformanceTracker.trackAgentCall(
        await this.collaborationManager.getAgent(initiatorId),
        startTime,
        true
      );

      // Analyze and optimize
      const analytics = await workflowAnalytics.analyzePerformance({ id: workflowId } as any);
      if (analytics.recommendations.length > 0) {
        this.emit('optimization_suggested', {
          workflowId,
          recommendations: analytics.recommendations
        });
      }
    } catch (error) {
      this.handleError(error as Error, workflowId, initiatorId);
    }
  }

  async broadcastToWorkflow(
    workflowId: string,
    senderId: string,
    message: any
  ): Promise<void> {
    const agents = this.activeCollaborations.get(workflowId);
    if (!agents) return;

    const collaborationMessage: Omit<CollaborationMessage, 'id'> = {
      type: 'broadcast',
      from: senderId,
      content: message,
      priority: 'medium',
      metadata: {
        timestamp: new Date().toISOString(),
        workflowId
      }
    };

    await this.collaborationManager.sendMessage(collaborationMessage);
  }

  private async handleAgentJoined(event: CollaborationEvent): Promise<void> {
    // Update UI
    this.emit('ui_update', {
      type: 'agent_status',
      data: {
        agentId: event.agentId,
        status: 'active',
        workflowId: event.data.workflowId
      }
    });
  }

  private async handleMessageSent(event: CollaborationEvent): Promise<void> {
    // Update collaboration metrics
    this.emit('ui_update', {
      type: 'collaboration_metrics',
      data: {
        messageCount: await this.collaborationManager.getMessageCount(),
        activeAgents: this.collaborationManager.getActiveAgents()
      }
    });
  }

  private async handleTaskCompleted(event: CollaborationEvent): Promise<void> {
    const { agentId, data } = event;
    
    // Remove task assignment
    const tasks = this.taskAssignments.get(agentId) || [];
    const taskIndex = tasks.indexOf(data.taskId);
    if (taskIndex > -1) {
      tasks.splice(taskIndex, 1);
      this.taskAssignments.set(agentId, tasks);
    }

    // Update UI
    this.emit('ui_update', {
      type: 'task_status',
      data: {
        taskId: data.taskId,
        status: 'completed',
        result: data.result
      }
    });
  }

  private async handleError(
    error: Error,
    workflowId: string,
    agentId: string
  ): Promise<void> {
    // Create alert
    await this.alertMonitor.monitorWorkflow({ id: workflowId } as any);

    // Update UI
    this.emit('ui_update', {
      type: 'error',
      data: {
        workflowId,
        agentId,
        error: error.message
      }
    });
  }

  getCollaborationStatus(workflowId: string): {
    activeAgents: Array<Agent>;
    pendingTasks: number;
    messageCount: number;
  } {
    const agents = Array.from(this.activeCollaborations.get(workflowId) || []);
    const pendingTasks = agents.reduce((count, agentId) => 
      count + (this.taskAssignments.get(agentId)?.length || 0), 0
    );

    return {
      activeAgents: agents,
      pendingTasks,
      messageCount: this.collaborationManager.getMessageCount()
    };
  }
}

export const collaborationOrchestrator = new CollaborationOrchestrator(); 