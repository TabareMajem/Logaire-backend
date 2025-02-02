import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export type AlertType = 'warning' | 'error' | 'info' | 'success';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  created_at: string;
  read: boolean;
}

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch alerts', error as Error);
    throw error;
  }
}

export async function markAlertAsRead(id: string): Promise<void> {
  try {
    
    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    ErrorLogger.error('Failed to mark alert as read', error as Error);
    throw error;
  }
}