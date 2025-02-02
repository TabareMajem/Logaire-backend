import { TrackingUpdate } from './types';
import { CarrierService } from './carrier-service';
import { Cache } from './cache';
import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';

export class TrackingService {
  private cache: Cache;
  private carrierService: CarrierService;

  constructor() {
    this.cache = new Cache();
    this.carrierService = new CarrierService();
  }

  async trackShipment(carrierId: string, reference: string): Promise<TrackingUpdate[]> {
    try {
      const cacheKey = `tracking:${carrierId}:${reference}`;
      const cachedUpdates = await this.cache.get<TrackingUpdate[]>(cacheKey);

      if (cachedUpdates) {
        return cachedUpdates;
      }

      const updates = await this.carrierService.trackShipment(carrierId, reference);
      
      // Cache for 15 minutes
      await this.cache.set(cacheKey, updates, 900);
      
      // Store updates in database
      await this.saveTrackingUpdates(reference, updates);
      
      return updates;
    } catch (error) {
      ErrorLogger.error('Failed to track shipment', error as Error);
      throw error;
    }
  }

  private async saveTrackingUpdates(reference: string, updates: TrackingUpdate[]): Promise<void> {
    try {
      
      const { error } = await supabase
        .from('tracking_updates')
        .insert(
          updates.map(update => ({
            shipment_reference: reference,
            status: update.status,
            location: update.location,
            timestamp: update.timestamp,
            description: update.description,
            vessel: update.vessel,
            container: update.container
          }))
        );

      if (error) throw error;
    } catch (error) {
      ErrorLogger.error('Failed to save tracking updates to database', error as Error);
      throw error;
    }
  }
}