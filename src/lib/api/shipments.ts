// src/lib/api/shipments.ts -->

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { Key, ReactNode } from 'react';

export type ShipmentStatus = 'draft' | 'booked' | 'in_transit' | 'customs' | 'delivered' | 'cancelled' | 'pending';


export interface Cargo {
  description: string;
  weight: number;
  volume: number;
  container_type?: string;
}

export interface Shipment {
  id: string;
  reference_number: string;
  status: ShipmentStatus;
  shipment_type: string;
  origin: {
    name: string;
    coordinates: [number, number];
  };
  destination: {
    name: string;
    coordinates: [number, number];
  };
  estimated_departure: string;
  estimated_arrival: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  cargo: Cargo;
}

export interface ShipmentFilters {
  status?: ShipmentStatus[];
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  page: number;
  limit: number;
}

export interface TrackingEvent {
  id: Key | null | undefined;
  description: ReactNode;
  event_type: string;
  timestamp: string;
  location?: {
    name: string;
    coordinates: [number, number];
  };
}

export async function fetchShipments(filters: ShipmentFilters) {
  try {
    let query = supabase
      .from('shipments')
      .select('*', { count: 'exact' });

    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters.search) {
      query = query.or(
        `reference_number.ilike.%${filters.search}%,` +
        `origin->name.ilike.%${filters.search}%,` +
        `destination->name.ilike.%${filters.search}%`
      );
    }

    if (filters.dateRange) {
      query = query
        .gte('estimated_departure', filters.dateRange.start.toISOString())
        .lte('estimated_departure', filters.dateRange.end.toISOString());
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(
        filters.page * filters.limit,
        (filters.page + 1) * filters.limit - 1
      );

    if (error) throw error;

    return {
      data,
      meta: {
        total: count || 0,
        page: filters.page,
        limit: filters.limit
      }
    };
  } catch (error) {
    ErrorLogger.error('Failed to fetch shipments', error as Error);
    throw error;
  }
}

export async function cancelShipment(shipmentId: string) {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .update({ status: 'cancelled' })
      .eq('id', shipmentId);

    if (error) throw error;

    return data; // Return the updated shipment data
  } catch (error) {
    ErrorLogger.error('Failed to cancel shipment', error as Error);
    throw error;
  }
}

// Function to update the status of a shipment
export async function updateShipmentStatus(id: string, status: Shipment['status']) {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return data; // Return the updated shipment data
  } catch (error) {
    ErrorLogger.error('Failed to update shipment status', error as Error);
    throw error;
  }
}

export async function createShipment(shipmentData: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipmentData]);

    if (error) throw error;

    return data; // Return the created shipment data
  } catch (error) {
    ErrorLogger.error('Failed to create shipment', error as Error);
    throw error;
  }
}

export async function fetchShipmentTracking(shipmentId: string) {
  try {
    const { data, error } = await supabase
      .from('tracking_events') // Assuming the table for tracking events is named 'tracking_events'
      .select('*')
      .eq('shipment_id', shipmentId) // Fetch events for the given shipment ID
      .order('timestamp', { ascending: false }); // Optional: order by timestamp, if needed

    if (error) throw error;

    return data; // Return the tracking events
  } catch (error) {
    ErrorLogger.error('Failed to fetch shipment tracking', error as Error);
    throw error;
  }
}