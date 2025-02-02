// src/hooks/useSystemHealth.ts -->

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  components: {
    [key: string]: {
      status: 'operational' | 'degraded' | 'down';
      latency: number;
      errorRate: number;
    };
  };
  alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: string;
  }>;
}

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    components: {},
    alerts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .single();

      if (error) throw error;

      setHealth(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    health,
    isLoading,
    error,
    refresh: fetchHealth
  };
}