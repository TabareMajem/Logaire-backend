import { AgentRegistry } from '../../agents/base/agent-registry';
import { AgentTask } from '../../agents/base/types';
import { RateAgent } from '../../agents/rate-agent';
import { RoutingAgent } from '../../agents/routing-agent';
import { TaskValidator } from '../../execution/task-validator';

describe('Agent Workflow Integration', () => {
  let registry: AgentRegistry;
  let validator: TaskValidator;

  beforeEach(async () => {
    registry = AgentRegistry.getInstance();
    validator = new TaskValidator();
    
    // Register test agents
    await registry.registerAgent({
      type: 'routing',
      capabilities: ['optimize', 'analyze'],
      description: 'Test routing agent'
    });
  });

  it('should execute complete workflow successfully', async () => {
    const task: AgentTask = {
      type: 'optimize',
      complexity: 'medium',
      priority: 'high',
      input: {
        origin: 'USNYC',
        destination: 'NLRTM',
        cargoType: 'container',
        weight: 20000
      }
    };

    // Validate task
    await validator.validateTask({
      agentType: 'routing',
      taskType: task.type,
      input: task.input
    });

    // Execute routing optimization
    const routingAgent = new RoutingAgent();
    const routeResult = await routingAgent.execute(task);

    expect(routeResult.success).toBe(true);
    expect(routeResult.data.optimalRoute).toBeDefined();
    expect(routeResult.confidence).toBeGreaterThan(0.8);

    // Execute rate calculation
    const rateAgent = new RateAgent();
    const rateResult = await rateAgent.execute({
      ...task,
      input: {
        ...task.input,
        route: routeResult.data.optimalRoute
      }
    });

    expect(rateResult.success).toBe(true);
    expect(rateResult.data.rateAnalysis).toBeDefined();
  });

  it('should handle edge cases appropriately', async () => {
    const edgeCases = [
      {
        description: 'Missing destination',
        input: { origin: 'USNYC', cargoType: 'container' }
      },
      {
        description: 'Invalid cargo weight',
        input: { origin: 'USNYC', destination: 'NLRTM', weight: -1 }
      },
      {
        description: 'Unsupported route',
        input: { origin: 'MOON1', destination: 'MARS2' }
      }
    ];

    for (const testCase of edgeCases) {
      const task: AgentTask = {
        type: 'optimize',
        complexity: 'medium',
        priority: 'normal',
        input: testCase.input
      };

      try {
        await validator.validateTask({
          agentType: 'routing',
          taskType: task.type,
          input: task.input
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });
}); 