"use client";

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export type TimeFrame = '7d' | '30d' | '90d';

export interface ShipmentStats {
  date: string;
  completed: number;
  active: number;
  delayed: number;
}

export interface PerformanceMetrics {
  date: string;
  onTimeDelivery: number;
  documentAccuracy: number;
  customerSatisfaction: number;
}

export async function fetchShipmentStats(timeframe: TimeFrame): Promise<ShipmentStats[]> {
  try {
    
    const { data, error } = await supabase
      .rpc('get_shipment_stats', { timeframe_param: timeframe });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch shipment stats', error as Error);
    throw error;
  }
}

export async function fetchPerformanceMetrics(timeframe: TimeFrame): Promise<PerformanceMetrics[]> {
  try {
    
    const { data, error } = await supabase
      .rpc('get_performance_metrics', { timeframe_param: timeframe });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch performance metrics', error as Error);
    throw error;
  }
}