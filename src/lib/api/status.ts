"use client";

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { ShipmentStatus } from '@/lib/api/shipments';

export interface StatusUpdate {
  shipmentId: string;
  newStatus: ShipmentStatus;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface StatusHistoryEntry {
  id: string;
  shipment_id: string;
  previous_status: ShipmentStatus;
  new_status: ShipmentStatus;
  reason?: string;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
}

const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ['booked', 'cancelled'],
  booked: ['in_transit', 'cancelled'],
  in_transit: ['customs', 'delivered', 'cancelled'],
  customs: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  pending: []
};

export async function updateShipmentStatus(update: StatusUpdate): Promise<void> {
  try {
    
    
    // Validate status transition
    const { data: shipment, error: fetchError } = await supabase
      .from('shipments')
      .select('status')
      .eq('id', update.shipmentId)
      .single();

    if (fetchError) throw fetchError;

    // if (!ALLOWED_TRANSITIONS[shipment.status].includes(update.newStatus)) {
    //   throw new Error(`Invalid status transition from ${shipment.status} to ${update.newStatus}`);
    // }
    if (!ALLOWED_TRANSITIONS[shipment.status as ShipmentStatus].includes(update.newStatus)) {
      throw new Error(`Invalid status transition from ${shipment.status} to ${update.newStatus}`);
    }
    

    // Update status using the database function
    const { error: updateError } = await supabase
      .rpc('update_shipment_status', {
        shipment_id: update.shipmentId,
        new_status: update.newStatus,
        reason: update.reason,
        metadata: update.metadata
      });

    if (updateError) throw updateError;
  } catch (error) {
    ErrorLogger.error('Failed to update shipment status', error as Error);
    throw error;
  }
}

export async function fetchStatusHistory(shipmentId: string): Promise<StatusHistoryEntry[]> {
  try {
    
    const { data, error } = await supabase
      .from('shipment_status_history')
      .select(`
        id,
        shipment_id,
        previous_status,
        new_status,
        reason,
        metadata,
        created_by,
        created_at
      `)
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch status history', error as Error);
    throw error;
  }
}

export function getAllowedTransitions(currentStatus: ShipmentStatus): ShipmentStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}