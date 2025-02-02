import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertRule, Metric } from '@/types/monitoring';
import { EventEmitter } from 'events';
import { alertRulesService } from './alert-rules-service';
import { notificationService } from './notification-service';

interface AlertEvaluation {
  ruleId: string;
  triggered: boolean;
  value: number;
  timestamp: string;
}

class AlertEvaluationService extends EventEmitter {
  private static instance: AlertEvaluationService;
  private evaluationCache: Map<string, AlertEvaluation> = new Map();
  private readonly EVALUATION_INTERVAL = 30000; // 30 seconds
  private evaluationTimer: NodeJS.Timer | null = null;

  private constructor() {
    super();
    this.startEvaluation();
  }

  static getInstance(): AlertEvaluationService {
    if (!this.instance) {
      this.instance = new AlertEvaluationService();
    }
    return this.instance;
  }

  private startEvaluation(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
    }

    this.evaluationTimer = setInterval(() => {
      this.evaluateAllRules();
    }, this.EVALUATION_INTERVAL);
  }

  private async evaluateAllRules(): Promise<void> {
    try {
      const rules = alertRulesService.getRules().filter(rule => rule.enabled);
      
      for (const rule of rules) {
        await this.evaluateRule(rule);
      }
    } catch (error) {
      ErrorLogger.error('Failed to evaluate alert rules', error as Error);
    }
  }

  private async evaluateRule(rule: AlertRule): Promise<void> {
    try {
      const { data: metrics, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('type', rule.metricType)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      const triggered = this.checkThreshold(rule, metrics.value);
      const evaluation: AlertEvaluation = {
        ruleId: rule.id,
        triggered,
        value: metrics.value,
        timestamp: new Date().toISOString()
      };

      await this.saveEvaluation(evaluation);

      if (triggered) {
        await this.handleTriggeredAlert(rule, metrics);
      }
    } catch (error) {
      ErrorLogger.error(`Failed to evaluate rule ${rule.id}`, error as Error);
    }
  }

  private checkThreshold(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
      case 'above':
        return value > rule.threshold;
      case 'below':
        return value < rule.threshold;
      case 'equals':
        return value === rule.threshold;
      default:
        return false;
    }
  }

  private async saveEvaluation(evaluation: AlertEvaluation): Promise<void> {
    try {
      const { error } = await supabase
        .from('alert_rule_evaluations')
        .insert([evaluation]);

      if (error) throw error;

      this.evaluationCache.set(evaluation.ruleId, evaluation);
      this.emit('evaluated', evaluation);
    } catch (error) {
      ErrorLogger.error('Failed to save evaluation', error as Error);
    }
  }

  private async handleTriggeredAlert(rule: AlertRule, metric: Metric): Promise<void> {
    try {
      const alert: Omit<Alert, 'id'> = {
        ruleId: rule.id,
        metricType: rule.metricType,
        severity: rule.severity,
        message: this.generateAlertMessage(rule, metric.value),
        value: metric.value,
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      const { data, error } = await supabase
        .from('alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;

      this.emit('alertTriggered', data);
      await notificationService.sendAlertNotification(data as Alert);
    } catch (error) {
      ErrorLogger.error('Failed to handle triggered alert', error as Error);
    }
  }

  private generateAlertMessage(rule: AlertRule, value: number): string {
    return `${rule.metricType.toUpperCase()} is ${rule.condition} ${rule.threshold} (current value: ${value})`;
  }

  async getEvaluationHistory(
    ruleId: string,
    from?: Date,
    to?: Date
  ): Promise<AlertEvaluation[]> {
    try {
      let query = supabase
        .from('alert_rule_evaluations')
        .select('*')
        .eq('rule_id', ruleId)
        .order('evaluated_at', { ascending: false });

      if (from) {
        query = query.gte('evaluated_at', from.toISOString());
      }
      if (to) {
        query = query.lte('evaluated_at', to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      ErrorLogger.error('Failed to get evaluation history', error as Error);
      throw error;
    }
  }

  onEvaluated(callback: (evaluation: AlertEvaluation) => void): () => void {
    this.on('evaluated', callback);
    return () => this.off('evaluated', callback);
  }

  onAlertTriggered(callback: (alert: Alert) => void): () => void {
    this.on('alertTriggered', callback);
    return () => this.off('alertTriggered', callback);
  }

  cleanup(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = null;
    }
    this.evaluationCache.clear();
    this.removeAllListeners();
  }
}

export const alertEvaluationService = AlertEvaluationService.getInstance(); 