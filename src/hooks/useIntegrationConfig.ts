// src/hooks/useIntegrationConfig.ts
import { useState, useEffect } from 'react';
import * as z from 'zod';

// Define the schema type to match the one in IntegrationConfigUI
const integrationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['shipping', 'customs', 'payment', 'document']),
  apiKey: z.string().min(1, 'API Key is required'),
  endpoint: z.string().url('Must be a valid URL'),
  enabled: z.boolean(),
  retryAttempts: z.number().min(0).max(10),
  timeout: z.number().min(1000).max(30000),
  webhookUrl: z.string().url().optional(),
  customHeaders: z.record(z.string()).optional(),
  rateLimiting: z.object({
    enabled: z.boolean(),
    maxRequests: z.number().min(1),
    timeWindow: z.number().min(1)
  })
});

type IntegrationConfig = z.infer<typeof integrationSchema>;

interface UseIntegrationConfigReturn {
  config: IntegrationConfig | null;
  isLoading: boolean;
  error: Error | null;
  saveConfig: (config: IntegrationConfig) => Promise<void>;
  testConnection: (config: IntegrationConfig) => Promise<{ success: boolean }>;
}

export function useIntegrationConfig(integrationId?: string): UseIntegrationConfigReturn {
  const [config, setConfig] = useState<IntegrationConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      if (!integrationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Replace this with your actual API call
        const response = await fetch(`/api/integrations/${integrationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch integration configuration');
        }

        const data = await response.json();
        // Validate the data against the schema
        const validatedConfig = integrationSchema.parse(data);
        setConfig(validatedConfig);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, [integrationId]);

  const saveConfig = async (newConfig: IntegrationConfig): Promise<void> => {
    try {
      // Validate the config before saving
      integrationSchema.parse(newConfig);

      const url = integrationId 
        ? `/api/integrations/${integrationId}`
        : '/api/integrations';

      const response = await fetch(url, {
        method: integrationId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save integration configuration');
      }

      const savedConfig = await response.json();
      setConfig(savedConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    }
  };

  const testConnection = async (testConfig: IntegrationConfig): Promise<{ success: boolean }> => {
    try {
      // Validate the config before testing
      integrationSchema.parse(testConfig);

      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testConfig),
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      const result = await response.json();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Connection test failed'));
      return { success: false };
    }
  };

  return {
    config,
    isLoading,
    error,
    saveConfig,
    testConnection,
  };
}