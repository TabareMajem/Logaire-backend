import { supabase } from '@/lib/supabase/client';
import { ModelSelector } from '../agents/base/model-selector';
import { AgentTask } from '../agents/base/types';

describe('ModelSelector', () => {
  let modelSelector: ModelSelector;

  beforeEach(() => {
    modelSelector = new ModelSelector();
  });

  describe('selectModel', () => {
    it('should select high performance model for complex tasks', async () => {
      const task: AgentTask = {
        type: 'analyze',
        complexity: 'complex',
        priority: 'high',
        input: {}
      };

      const model = await modelSelector.selectModel(task, 'document');
      expect(model).toBe('claude-3-opus-20240229');
    });

    it('should select efficient model for simple tasks', async () => {
      const task: AgentTask = {
        type: 'validate',
        complexity: 'simple',
        priority: 'low',
        input: {}
      };

      const model = await modelSelector.selectModel(task, 'document');
      expect(model).toBe('claude-3-haiku-20240307');
    });

    it('should use performance data when available', async () => {
      // Insert test performance data
      await supabase.from('model_performance').insert({
        model_id: 'claude-3-sonnet-20240229',
        agent_type: 'document',
        task_type: 'analyze',
        success_rate: 0.95,
        avg_latency: 500,
        cost_per_token: 0.01,
        sample_size: 100
      });

      const task: AgentTask = {
        type: 'analyze',
        complexity: 'medium',
        priority: 'medium',
        input: {}
      };

      const model = await modelSelector.selectModel(task, 'document');
      expect(model).toBe('claude-3-sonnet-20240229');
    });
  });
}); 