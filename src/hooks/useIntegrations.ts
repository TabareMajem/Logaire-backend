// src/hooks/useIntegrations.ts -->

import { calculateMetrics } from '@/lib/ai/utils/metrics';
import { supabase } from '@/lib/supabase/client';
import { Integration, IntegrationConfig } from '@/types/integrations';
import { useEffect, useState } from 'react';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [metrics, setMetrics] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchIntegrations();
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch metrics data from your backend or API
      const fetchedMetrics = {}; // Replace with real data fetching logic
      setMetrics(fetchedMetrics);
    } catch (err) {
      setError(err as Error);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIntegrations(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (config: IntegrationConfig) => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert([{
          ...config,
          status: 'inactive',
          uptime: 0,
          errorRate: 0,
          latency: 0,
          lastSync: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setIntegrations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateIntegration = async (id: string, updates: Partial<Integration>) => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === id ? { ...integration, ...data } : integration
        )
      );
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev =>
        prev.filter(integration => integration.id !== id)
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // return {
  //   integrations,
  //   isLoading,
  //   error,
  //   createIntegration,
  //   updateIntegration,
  //   deleteIntegration,
  //   refresh: fetchIntegrations
  // };

  return {
    integrations,
    metrics,
    isLoading,
    error,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    refresh: fetchIntegrations,
  };
} 