// src/types/monitoring.ts -->

export type MetricType = 'cpu' | 'memory' | 'disk' | 'network';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical' | 'error' | 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface Metric {
  id: string;
  type: MetricType;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  metricType: MetricType;
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
}

export interface Alert {
  threshold: string;
  value: string;
  condition: string;
  resolved: any;
  createdAt: string | number | Date;
  type: string;
  id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  timestamp: string;
  metric?: {
    type: MetricType;
    value: number;
    threshold: number;
  };
}

export interface HealthCheck {
  component: string;
  status: HealthStatus;
  latency?: number;
  errorRate?: number;
  lastCheck: string;
  message?: string;
}

export interface MonitoringConfig {
  metrics: {
    collectionInterval: number;
    retentionDays: number;
    enableAggregation: boolean;
    enabledMetrics: string[];  // Add this line
    aggregationRules: {        // Add this line
      function: 'max' | 'min' | 'avg' | 'sum';
      metric: string;
      interval: string;
    }[];                      // Add this line
  };
  alerts: {
    enableEmailNotifications: boolean;
    enableSlackNotifications: boolean;
    notificationEndpoints: string[];  // Make sure this is defined
    thresholds: Record<MetricType, {
      evaluationPeriod: number;
      warning: number;
      critical: number;
    }>;
  };
}

export interface CustomMetricDefinition {
  id: string;
  name: string;
  description?: string;
  formula: string;
  baseMetrics: MetricType[];
  unit: string;
  thresholds?: {
    warning: number;
    critical: number;
  };
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomMetricFormula = {
  operation: 'sum' | 'avg' | 'max' | 'min' | 'multiply' | 'divide';
  metrics: MetricType[];
  constant?: number;
}; 