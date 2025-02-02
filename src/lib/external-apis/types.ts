done done

export interface ExternalAPIConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryConfig?: {
    attempts: number;
    backoff: number;
  };
}

export interface APIResponse<T> {
  data: T;
  timestamp: Date;
  source: string;
  reliability: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
  source: string;
  timestamp: Date;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
}