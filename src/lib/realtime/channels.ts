import { supabase } from '@/lib/supabase/client';
import { QueryClient } from '@tanstack/react-query';
import { handleAlertUpdate, handleDocumentUpdate, handleActivityUpdate } from './handlers';
import { ErrorLogger } from '@/lib/errors/logger';
import { Alert } from '../api/alerts';

export function setupRealtimeChannels(queryClient: QueryClient) {
  

  try {
    // Create a single channel for all updates
    const channel = supabase.channel('dashboard-updates')
      // Listen for alerts
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        // (payload) => handleAlertUpdate(queryClient, payload.new)
        (payload) => handleAlertUpdate(queryClient, payload.new as Alert)

      )
      // Listen for documents
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'documents' },
        // (payload) => handleDocumentUpdate(queryClient, payload.new)
        (payload) => handleAlertUpdate(queryClient, payload.new as Alert)
      )
      // Listen for activities
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        // (payload) => handleActivityUpdate(queryClient, payload.new)
        (payload) => handleAlertUpdate(queryClient, payload.new as Alert)
      );

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to real-time updates');
      }
    });

    // Return cleanup function
    return () => {
      channel.unsubscribe();
    };
  } catch (error) {
    ErrorLogger.error('Failed to setup realtime channels', error as Error);
    return () => {}; // Return empty cleanup function
  }
}