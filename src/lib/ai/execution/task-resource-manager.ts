import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

interface ResourceUsage {
  memory: number;
  cpu: number;
  networkBandwidth: number;
}

interface ResourceLimits {
  maxMemory: number;
  maxCpu: number;
  maxNetworkBandwidth: number;
}

export class TaskResourceManager {
  private readonly supabase = supabase;

  async allocateResources(taskId: string, requirements: Partial<ResourceLimits>): Promise<void> {
    try {
      const currentUsage = await this.getCurrentUsage();
      const limits = await this.getResourceLimits();

      this.validateResourceAvailability(currentUsage, requirements, limits);
      await this.reserveResources(taskId, requirements);
    } catch (error) {
      ErrorLogger.error('Resource allocation failed', error as Error);
      throw error;
    }
  }

  private async getCurrentUsage(): Promise<ResourceUsage> {
    const { data, error } = await this.supabase
      .from('resource_usage')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  private async getResourceLimits(): Promise<ResourceLimits> {
    const { data, error } = await this.supabase
      .from('resource_limits')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  private validateResourceAvailability(
    currentUsage: ResourceUsage,
    requirements: Partial<ResourceLimits>,
    limits: ResourceLimits
  ): void {
    if (requirements.maxMemory && currentUsage.memory + requirements.maxMemory > limits.maxMemory) {
      throw new Error('Insufficient memory available');
    }

    if (requirements.maxCpu && currentUsage.cpu + requirements.maxCpu > limits.maxCpu) {
      throw new Error('Insufficient CPU available');
    }

    if (requirements.maxNetworkBandwidth && 
        currentUsage.networkBandwidth + requirements.maxNetworkBandwidth > limits.maxNetworkBandwidth) {
      throw new Error('Insufficient network bandwidth available');
    }
  }

  private async reserveResources(
    taskId: string,
    requirements: Partial<ResourceLimits>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('resource_reservations')
      .insert({
        task_id: taskId,
        requirements,
        reserved_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}