import { dbManager } from '@/lib/database/connection-manager';
import { ErrorLogger } from '@/lib/errors/logger';
import { WebSocketServer } from '@/lib/websocket/server';
import { EventEmitter } from 'events';
import { metricsCollector } from '../metrics/metrics-collector';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  details?: Record<string, any>;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  message: string;
  enabled: boolean;
}

interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'neq';
  threshold: number;
  duration?: number; // Duration in seconds the condition must be true
}

export class AlertSystem extends EventEmitter {
  private rules: Map<string, AlertRule>;
  private activeAlerts: Map<string, Alert>;
  private wsServer: WebSocketServer;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds

  constructor(wsServer: WebSocketServer) {
    super();
    this.rules = new Map();
    this.activeAlerts = new Map();
    this.wsServer = wsServer;
    this.loadAlertRules();
    this.startAlertChecks();
  }

  async createAlert(
    type: string,
    severity: AlertSeverity,
    message: string,
    details?: Record<string, any>
  ): Promise<Alert> {
    try {
      const alert: Alert = {
        id: crypto.randomUUID(),
        type,
        severity,
        message,
        details,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.saveAlert(alert);
      this.activeAlerts.set(alert.id, alert);
      this.notifyAlert(alert);

      return alert;
    } catch (error) {
      ErrorLogger.error('Error creating alert:', error as Error);
      throw error;
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alert = this.activeAlerts.get(alertId);
      if (!alert) throw new Error(`Alert ${alertId} not found`);

      alert.status = 'acknowledged';
      alert.acknowledgedBy = userId;
      alert.updatedAt = new Date().toISOString();

      await this.updateAlert(alert);
      this.notifyAlertUpdate(alert);
    } catch (error) {
      ErrorLogger.error('Error acknowledging alert:', error as Error);
      throw error;
    }
  }

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alert = this.activeAlerts.get(alertId);
      if (!alert) throw new Error(`Alert ${alertId} not found`);

      alert.status = 'resolved';
      alert.resolvedBy = userId;
      alert.updatedAt = new Date().toISOString();

      await this.updateAlert(alert);
      this.activeAlerts.delete(alertId);
      this.notifyAlertUpdate(alert);
    } catch (error) {
      ErrorLogger.error('Error resolving alert:', error as Error);
      throw error;
    }
  }

  async addRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    try {
      const newRule: AlertRule = {
        ...rule,
        id: crypto.randomUUID()
      };

      await dbManager.query(
        'INSERT INTO alert_rules (id, name, condition, severity, message, enabled) VALUES ($1, $2, $3, $4, $5, $6)',
        [newRule.id, newRule.name, newRule.condition, newRule.severity, newRule.message, newRule.enabled]
      );

      this.rules.set(newRule.id, newRule);
      return newRule;
    } catch (error) {
      ErrorLogger.error('Error adding alert rule:', error as Error);
      throw error;
    }
  }

  private async loadAlertRules(): Promise<void> {
    try {
      const rules = await dbManager.query<AlertRule>('SELECT * FROM alert_rules WHERE enabled = true');
      rules.forEach(rule => this.rules.set(rule.id, rule));
    } catch (error) {
      ErrorLogger.error('Error loading alert rules:', error as Error);
    }
  }

  private async saveAlert(alert: Alert): Promise<void> {
    await dbManager.query(
      'INSERT INTO alerts (id, type, severity, message, details, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [alert.id, alert.type, alert.severity, alert.message, alert.details, alert.status, alert.createdAt, alert.updatedAt]
    );
  }

  private async updateAlert(alert: Alert): Promise<void> {
    await dbManager.query(
      'UPDATE alerts SET status = $1, updated_at = $2, acknowledged_by = $3, resolved_by = $4 WHERE id = $5',
      [alert.status, alert.updatedAt, alert.acknowledgedBy, alert.resolvedBy, alert.id]
    );
  }

  private notifyAlert(alert: Alert): void {
    this.emit('alert', alert);
    this.wsServer.broadcast('alert', alert);
  }

  private notifyAlertUpdate(alert: Alert): void {
    this.emit('alertUpdate', alert);
    this.wsServer.broadcast('alertUpdate', alert);
  }

  private startAlertChecks(): void {
    setInterval(async () => {
      try {
        for (const rule of this.rules.values()) {
          await this.checkRule(rule);
        }
      } catch (error) {
        ErrorLogger.error('Error checking alert rules:', error as Error);
      }
    }, this.CHECK_INTERVAL);
  }

  private async checkRule(rule: AlertRule): Promise<void> {
    try {
      const metrics = await metricsCollector.queryMetrics({
        type: rule.condition.metric as any,
        startTime: new Date(Date.now() - (rule.condition.duration || 300) * 1000).toISOString()
      });

      const shouldAlert = this.evaluateCondition(rule.condition, metrics);
      if (shouldAlert) {
        await this.createAlert(
          rule.name,
          rule.severity,
          rule.message,
          { condition: rule.condition, metrics }
        );
      }
    } catch (error) {
      ErrorLogger.error('Error checking rule:', error as Error);
    }
  }

  private evaluateCondition(condition: AlertCondition, metrics: any[]): boolean {
    if (metrics.length === 0) return false;

    const latestValue = metrics[0].value;
    switch (condition.operator) {
      case 'gt':
        return latestValue > condition.threshold;
      case 'lt':
        return latestValue < condition.threshold;
      case 'eq':
        return latestValue === condition.threshold;
      case 'neq':
        return latestValue !== condition.threshold;
      default:
        return false;
    }
  }
} 