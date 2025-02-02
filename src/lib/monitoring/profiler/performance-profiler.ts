import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

interface ProfilePoint {
  timestamp: number;
  memory: number;
  cpu: number;
  eventLoop: number;
}

export class PerformanceProfiler {
  private static instance: PerformanceProfiler;
  private profilePoints: ProfilePoint[] = [];
  private isRecording = false;

  private constructor() {}

  static getInstance(): PerformanceProfiler {
    if (!this.instance) {
      this.instance = new PerformanceProfiler();
    }
    return this.instance;
  }

  startProfiling(): void {
    this.isRecording = true;
    this.recordProfile();
  }

  stopProfiling(): ProfilePoint[] {
    this.isRecording = false;
    const profile = [...this.profilePoints];
    this.profilePoints = [];
    return profile;
  }

  private async recordProfile(): Promise<void> {
    if (!this.isRecording) return;

    try {
      const point: ProfilePoint = {
        timestamp: Date.now(),
        memory: process.memoryUsage().heapUsed,
        cpu: await this.getCPUUsage(),
        eventLoop: await this.getEventLoopLag()
      };

      this.profilePoints.push(point);
      await this.persistProfilePoint(point);

      setTimeout(() => this.recordProfile(), 1000);
    } catch (error) {
      ErrorLogger.error('Profiling error', error as Error);
    }
  }

  private async getCPUUsage(): Promise<number> {
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    return (endUsage.user + endUsage.system) / 1000000;
  }

  private async getEventLoopLag(): Promise<number> {
    const start = Date.now();
    return new Promise(resolve => {
      setImmediate(() => {
        resolve(Date.now() - start);
      });
    });
  }

  private async persistProfilePoint(point: ProfilePoint): Promise<void> {
    const { error } = await supabase
      .from('performance_profiles')
      .insert(point);

    if (error) {
      ErrorLogger.error('Failed to persist profile point', error);
    }
  }
} 