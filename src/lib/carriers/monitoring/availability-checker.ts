import { supabase } from '@/lib/supabase/client';
import { CarrierHub } from '../core/carrier-hub';
import { AlertManager } from './alert-manager';
import { ErrorLogger } from '@/lib/errors/logger';

interface AvailabilityStatus {
  status: 'available' | 'degraded' | 'unavailable';
  latency: number;
  error?: string;
}

export class AvailabilityChecker {
  private readonly supabase = supabase;;
  private readonly alertManager: AlertManager;

  constructor(private readonly hub: CarrierHub) {
    this.alertManager = new AlertManager();
  }

  async checkAvailability(): Promise<Record<string, AvailabilityStatus>> {
    const status: Record<string, AvailabilityStatus> = {};

    try {
      const carriers = this.hub.getCarriers();

      for (const [carrierId, adapter] of carriers) {
        status[carrierId] = await this.checkCarrierAvailability(carrierId, adapter);
      }

      await this.updateAvailabilityStatus(status);
      await this.handleAvailabilityIssues(status);

      return status;
    } catch (error) {
      ErrorLogger.error('Availability check failed', error as Error);
      throw error;
    }
  }

  private async checkCarrierAvailability(carrierId: string, adapter: any): Promise<AvailabilityStatus> {
    const startTime = Date.now();

    try {
      await adapter.checkAvailability();
      return {
        status: 'available',
        latency: Date.now() - startTime
      };
    } catch (error) {
      const status: AvailabilityStatus = {
        status: this.determineStatus(error as Error),
        latency: Date.now() - startTime,
        error: (error as Error).message
      };

      ErrorLogger.error(`Availability check failed for carrier ${carrierId}`, error as Error);
      return status;
    }
  }

  private determineStatus(error: Error): 'degraded' | 'unavailable' {
    if (error.message.includes('timeout') || error.message.includes('rate limit')) {
      return 'degraded';
    }
    return 'unavailable';
  }

  private async updateAvailabilityStatus(status: Record<string, AvailabilityStatus>): Promise<void> {
    const { error } = await this.supabase
      .from('carrier_availability')
      .insert(
        Object.entries(status).map(([carrierId, availability]) => ({
          carrier_id: carrierId,
          status: availability.status,
          latency: availability.latency,
          error: availability.error,
          checked_at: new Date().toISOString()
        }))
      );

    if (error) {
      ErrorLogger.error('Failed to update availability status', error);
    }
  }

  private async handleAvailabilityIssues(status: Record<string, AvailabilityStatus>): Promise<void> {
    for (const [carrierId, availability] of Object.entries(status)) {
      if (availability.status !== 'available') {
        await this.alertManager.createAlert({
          carrierId,
          type: 'availability',
          severity: availability.status === 'unavailable' ? 'high' : 'medium',
          message: `Carrier ${carrierId} is ${availability.status}`,
          details: {
            latency: availability.latency,
            error: availability.error
          }
        });
      }
    }
  }
}