"use client";

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';


export type CostType = 'transport' | 'storage' | 'customs' | 'documentation' | 'insurance' | 'other' | 'freight';
export type CostStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

export interface ShipmentCost {
  id: string;
  shipment_id: string;
  cost_type: CostType;
  description: string;
  amount: number;
  currency: string;
  vendor_id?: string;
  status: CostStatus;
  invoice_number?: string;
  payment_terms?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
  };
}

export async function fetchShipmentCosts(shipmentId: string): Promise<ShipmentCost[]> {
  try {
    
    const { data, error } = await supabase
      .from('shipment_costs')
      .select(`
        *,
        vendor:vendors (
          id,
          name
        )
      `)
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch shipment costs', error as Error);
    throw error;
  }
}

export async function createCost(cost: Omit<ShipmentCost, 'id' | 'created_at' | 'updated_at'>): Promise<ShipmentCost> {
  try {
    
    const { data, error } = await supabase
      .from('shipment_costs')
      .insert(cost)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to create cost', error as Error);
    throw error;
  }
}

export async function updateCostStatus(id: string, status: CostStatus): Promise<void> {
  try {
    
    const { error } = await supabase
      .from('shipment_costs')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    ErrorLogger.error('Failed to update cost status', error as Error);
    throw error;
  }
}