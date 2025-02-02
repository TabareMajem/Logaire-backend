import { supabase } from '@/lib/supabase/client';
import { AgentConfig } from '@/types/agents';
import { useEffect, useState } from 'react';

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  config: AgentConfig;
  lastHeartbeat: string;
  metadata?: Record<string, any>;
  currentLoad: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('monitoring_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAgents(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (config: AgentConfig) => {
    try {
      const { data, error } = await supabase
        .from('monitoring_agents')
        .insert([config])
        .select()
        .single();

      if (error) throw error;

      setAgents(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateAgent = async (id: string, updates: Partial<AgentConfig>) => {
    try {
      const { data, error } = await supabase
        .from('monitoring_agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAgents(prev => prev.map(agent => 
        agent.id === id ? { ...agent, ...data } : agent
      ));
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monitoring_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgents(prev => prev.filter(agent => agent.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    agents,
    isLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    refresh: fetchAgents
  };
} 