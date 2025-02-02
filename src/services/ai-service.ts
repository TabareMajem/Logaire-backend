import { AgentFactory } from '@/lib/ai/agents/base/agent-factory';
import { AgentOrchestrator } from '@/lib/ai/agents/base/agent-orchestrator';
import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

export class AIService {
  private readonly orchestrator: AgentOrchestrator;
  private readonly factory: AgentFactory;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.factory = new AgentFactory();
    this.registerAgents();
  }

  private registerAgents() {
    // Register all available agents
    this.factory.registerAgent('document', {
      type: 'document',
      capabilities: ['analyze', 'extract', 'validate'],
      description: 'Analyzes shipping documents for key information'
    });

    this.factory.registerAgent('customer-service', {
      type: 'customer-service',
      capabilities: ['handleQuery', 'generateResponse', 'checkEscalation'],
      description: 'Handles customer service interactions'
    });

    this.factory.registerAgent('port-congestion', {
      type: 'port-congestion',
      capabilities: ['analyze', 'predict', 'monitor'],
      description: 'Analyzes and predicts port congestion'
    });

    this.factory.registerAgent('rate', {
      type: 'rate',
      capabilities: ['calculate', 'optimize', 'forecast'],
      description: 'Calculates and optimizes shipping rates'
    });

    this.factory.registerAgent('routing', {
      type: 'routing',
      capabilities: ['optimize', 'analyze', 'monitor'],
      description: 'Optimizes shipping routes'
    });
  }

  async executeTask(
    agentType: string,
    task: any,
    context: Record<string, any>
  ) {
    try {
      // Record task start
      const { data: execution, error } = await supabase
        .from('agent_executions')
        .insert({
          agent_type: agentType,
          task_type: task.type,
          task_data: task,
          status: 'running',
          created_by: context.userId
        })
        .select()
        .single();

      if (error) throw error;

      // Execute task
      const result = await this.orchestrator.executeTask(
        agentType,
        task,
        context
      );

      // Update execution record
      await supabase
        .from('agent_executions')
        .update({
          status: result.success ? 'completed' : 'failed',
          result,
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id);

      return result;
    } catch (error) {
      ErrorLogger.error('Task execution failed', error as Error);
      throw error;
    }
  }

  async getAgentMetrics(agentType: string) {
    return this.orchestrator.getAgentMetrics(agentType);
  }

  async getActiveExecutions() {
    return this.orchestrator.getActiveExecutions();
  }

  async getAgentConfiguration(agentType: string) {
    const { data, error } = await supabase
      .from('agent_configurations')
      .select('*')
      .eq('agent_type', agentType)
      .single();

    if (error) throw error;
    return data;
  }

  async updateAgentConfiguration(agentType: string, config: any) {
    const { error } = await supabase
      .from('agent_configurations')
      .update(config)
      .eq('agent_type', agentType);

    if (error) throw error;
  }
} 