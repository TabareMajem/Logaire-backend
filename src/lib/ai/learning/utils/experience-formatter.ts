import { AgentExperience } from '../types';
import { ErrorLogger } from '@/lib/errors/logger';

export class ExperienceFormatter {
  formatForStorage(experience: AgentExperience): Record<string, any> {
    try {
      return {
        agent_type: experience.agentType,
        task_type: experience.taskType,
        input: this.sanitizeData(experience.input),
        output: this.sanitizeData(experience.output),
        duration: Math.round(experience.duration),
        resource_usage: Math.round(experience.resourceUsage * 100) / 100,
        success: experience.success,
        accuracy: Math.round(experience.accuracy * 1000) / 1000,
        quality: Math.round(experience.quality * 1000) / 1000,
        impact: Math.round(experience.impact * 1000) / 1000,
        timestamp: experience.timestamp.toISOString()
      };
    } catch (error) {
      ErrorLogger.error('Failed to format experience', error as Error);
      throw error;
    }
  }

  formatForAnalysis(experience: AgentExperience): Record<string, number> {
    try {
      return {
        accuracy: experience.accuracy,
        duration: experience.duration,
        resourceUsage: experience.resourceUsage,
        quality: experience.quality,
        impact: experience.impact
      };
    } catch (error) {
      ErrorLogger.error('Failed to format experience for analysis', error as Error);
      throw error;
    }
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip functions and undefined values
      if (typeof value === 'function' || value === undefined) {
        continue;
      }
      sanitized[key] = this.sanitizeData(value);
    }

    return sanitized;
  }
}