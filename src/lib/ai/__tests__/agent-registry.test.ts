import { supabase } from '@/lib/supabase/client';
import { AgentRegistry } from '../agents/base/agent-registry';

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = AgentRegistry.getInstance();
  });

  afterEach(async () => {
    await supabase.from('agent_registry').delete().neq('agent_type', '');
  });

  describe('registerAgent', () => {
    it('should register a new agent successfully', async () => {
      const registration = {
        type: 'test-agent',
        capabilities: ['test', 'analyze'],
        description: 'Test agent'
      };

      await registry.registerAgent(registration);
      const agent = await registry.getAgent(registration.type);

      expect(agent).toBeDefined();
      expect(agent?.type).toBe(registration.type);
      expect(agent?.capabilities).toEqual(registration.capabilities);
    });

    it('should update existing agent registration', async () => {
      const registration = {
        type: 'test-agent',
        capabilities: ['test'],
        description: 'Original description'
      };

      await registry.registerAgent(registration);

      const updatedRegistration = {
        ...registration,
        capabilities: ['test', 'new-capability'],
        description: 'Updated description'
      };

      await registry.registerAgent(updatedRegistration);
      const agent = await registry.getAgent(registration.type);

      expect(agent?.capabilities).toEqual(updatedRegistration.capabilities);
      expect(agent?.description).toBe(updatedRegistration.description);
    });
  });

  // Add more test cases...
}); 