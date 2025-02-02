// src/lib/carriers/core/carrier-service.ts -->

import { CarrierHub } from './carrier-hub';
import { CarrierFactory } from './carrier-factory';
import { RateRequest, Rate, BookingRequest, BookingConfirmation } from '../types';
import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class CarrierService {
  private hub: CarrierHub;
  private supabase = supabase;;

  constructor() {
    this.hub = new CarrierHub();
    this.initializeCarriers();
  }

  private async initializeCarriers(): Promise<void> {
    try {
      const { data: configs, error } = await this.supabase
        .from('carrier_configurations')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      for (const config of configs) {
        const carrier = CarrierFactory.createCarrier(config);
        this.hub.registerCarrier(config.id, carrier);
      }
    } catch (error) {
      ErrorLogger.error('Failed to initialize carriers', error as Error);
      throw error;
    }
  }

  async getRates(request: RateRequest): Promise<Rate[]> {
    try {
      return await this.hub.getRates(request);
    } catch (error) {
      ErrorLogger.error('Failed to get rates', error as Error);
      throw error;
    }
  }

  async createBooking(carrierId: string, request: BookingRequest): Promise<BookingConfirmation> {
    try {
      return await this.hub.createBooking(carrierId, request);
    } catch (error) {
      ErrorLogger.error('Failed to create booking', error as Error);
      throw error;
    }
  }

  async getCarrierHealth(): Promise<Record<string, {
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: Date;
    latency: number; // Add latency
    error?: string;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('carrier_health')
        .select('*')
        .order('checked_at', { ascending: false });
  
      if (error) throw error;
  
      return data.reduce((acc, check) => ({
        ...acc,
        [check.carrier_id]: {
          status: check.status,
          lastCheck: new Date(check.checked_at),
          latency: check.latency || 0, // Ensure latency is included
          error: check.error
        }
      }), {});
    } catch (error) {
      ErrorLogger.error('Failed to get carrier health', error as Error);
      throw error;
    }
  }

}