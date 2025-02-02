import { supabase } from '@/lib/supabase/client';
import { BaseCarrier } from './base-carrier';
import { createCarrier } from './factory';
import { CarrierConfig, RateRequest, Rate, BookingRequest, BookingConfirmation, TrackingUpdate } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export class CarrierService {
  private carriers: Map<string, BaseCarrier> = new Map();
  private aggregators: BaseCarrier[] = [];

  constructor() {
    this.initializeCarriers();
  }

  private async initializeCarriers() {
    try {
      const configurations = await this.loadCarrierConfigs();
      
      for (const config of configurations) {
        const carrier = createCarrier(config);
        
        if (config.type === 'aggregator') {
          this.aggregators.push(carrier);
        } else {
          this.carriers.set(config.code, carrier);
        }
      }
    } catch (error) {
      ErrorLogger.error('Failed to initialize carriers', error as Error);
      throw error;
    }
  }

  private async loadCarrierConfigs(): Promise<CarrierConfig[]> {
    try {
      
      const { data, error } = await supabase
        .from('carrier_configurations')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorLogger.error('Failed to load carrier configurations', error as Error);
      throw error;
    }
  }

  async getRatesFromAllCarriers(request: RateRequest): Promise<Rate[]> {
    try {
      const [directRates, aggregatorRates] = await Promise.all([
        this.getDirectCarrierRates(request),
        this.getAggregatorRates(request)
      ]);

      return this.deduplicateRates([...directRates, ...aggregatorRates]);
    } catch (error) {
      ErrorLogger.error('Failed to get rates from carriers', error as Error);
      throw error;
    }
  }

  private async getDirectCarrierRates(request: RateRequest): Promise<Rate[]> {
    const ratePromises = Array.from(this.carriers.values())
      .map(carrier => 
        carrier.getRates(request)
          .catch(error => {
            ErrorLogger.error(`Failed to get rates from ${carrier.config.code}`, error as Error);
            return [];
          })
      );

    const rates = await Promise.all(ratePromises);
    return rates.flat();
  }

  private async getAggregatorRates(request: RateRequest): Promise<Rate[]> {
    const ratePromises = this.aggregators.map(aggregator =>
      aggregator.getRates(request)
        .catch(error => {
          ErrorLogger.error(`Failed to get rates from aggregator ${aggregator.config.code}`, error as Error);
          return [];
        })
    );

    const rates = await Promise.all(ratePromises);
    return rates.flat();
  }

  private deduplicateRates(rates: Rate[]): Rate[] {
    const seen = new Set<string>();
    return rates.filter(rate => {
      const key = `${rate.carrierId}-${rate.serviceType}-${rate.price.amount}-${rate.price.currency}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async createBooking(carrierId: string, booking: BookingRequest): Promise<BookingConfirmation> {
    const carrier = this.carriers.get(carrierId);
    
    if (!carrier) {
      throw new Error(`Carrier ${carrierId} not found`);
    }

    try {
      return await carrier.createBooking(booking);
    } catch (error) {
      ErrorLogger.error(`Failed to create booking with carrier ${carrierId}`, error as Error);
      throw error;
    }
  }

  async trackShipment(carrierId: string, reference: string): Promise<TrackingUpdate[]> {
    const carrier = this.carriers.get(carrierId);
    
    if (!carrier) {
      throw new Error(`Carrier ${carrierId} not found`);
    }

    try {
      return await carrier.trackShipment(reference);
    } catch (error) {
      ErrorLogger.error(`Failed to track shipment with carrier ${carrierId}`, error as Error);
      throw error;
    }
  }
}