// src/types/integrations.ts -->

export type IntegrationType = 
  | 'api' 
  | 'webhook' 
  | 'database' 
  | 'messaging' 
  | 'storage'
  | 'analytics'
  | 'shipping' 
  | 'customs' 
  | 'payment' 
  | 'document';


export interface Integration {
  errorRate: any;
  settings: { [x: string]: any; } | undefined;
  apiSecret: string | undefined;
  apiKey: string | undefined;
  endpoint: string | undefined;
  id: string;
  name: string;
  type: IntegrationType;
  enabled: boolean;
  config: Record<string, any>;  
  status: 'operational' | 'degraded' | 'down' | 'active' | 'inactive' | 'error';
  lastSync?: string;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  uptime: number;
  latency: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfig {
  name: string;
  type: IntegrationType;
  credentials?: {
    apiKey?: string;
    secretKey?: string;
    accessToken?: string;
    [key: string]: any;
  };
  settings?: {
    endpoint?: string;
    region?: string;
    timeout?: number;
    retryAttempts?: number;
    [key: string]: any;
  };
  webhooks?: {
    enabled: boolean;
    endpoints: string[];
    events: string[];
  };
} 