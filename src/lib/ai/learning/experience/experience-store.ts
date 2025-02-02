import { supabase } from '@/lib/supabase/client';
import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class ExperienceStore {
  private readonly supabase = supabase;

  async store(experience: AgentExperience): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_experiences')
        .insert({
          agent_type: experience.agentType,
          task_type: experience.taskType,
          input: experience.input,
          output: experience.output,
          duration: experience.duration,
          resource_usage: experience.resourceUsage,
          success: experience.success,
          accuracy: experience.accuracy,
          quality: experience.quality,
          impact: experience.impact,
          timestamp: experience.timestamp.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to store experience', error as Error);
      throw error;
    }
  }

  async getRecentExperiences(
    agentType: string,
    limit: number = 100
  ): Promise<AgentExperience[]> {
    try {
      const { data, error } = await this.supabase
        .from('agent_experiences')
        .select('*')
        .eq('agent_type', agentType)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get recent experiences', error as Error);
      throw error;
    }
  }
}