import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { AlertRule, MetricType } from '@/types/monitoring';
import { EventEmitter } from 'events';

interface AlertRuleEvent {
  type: 'created' | 'updated' | 'deleted';
  rule: AlertRule;
}

class AlertRulesService extends EventEmitter {
  private static instance: AlertRulesService;
  private rules: Map<string, AlertRule> = new Map();

  private constructor() {
    super();
    this.loadRules();
  }

  static getInstance(): AlertRulesService {
    if (!this.instance) {
      this.instance = new AlertRulesService();
    }
    return this.instance;
  }

  private async loadRules(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      data.forEach(rule => {
        this.rules.set(rule.id, rule);
      });
    } catch (error) {
      ErrorLogger.error('Failed to load alert rules', error as Error);
      throw error;
    }
  }

  async createRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert([rule])
        .select()
        .single();

      if (error) throw error;

      const newRule = data as AlertRule;
      this.rules.set(newRule.id, newRule);
      this.emit('ruleChange', { type: 'created', rule: newRule });

      return newRule;
    } catch (error) {
      ErrorLogger.error('Failed to create alert rule', error as Error);
      throw error;
    }
  }

  async updateRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRule = data as AlertRule;
      this.rules.set(updatedRule.id, updatedRule);
      this.emit('ruleChange', { type: 'updated', rule: updatedRule });

      return updatedRule;
    } catch (error) {
      ErrorLogger.error('Failed to update alert rule', error as Error);
      throw error;
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      const rule = this.rules.get(id);
      if (!rule) throw new Error('Rule not found');

      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.rules.delete(id);
      this.emit('ruleChange', { type: 'deleted', rule });
    } catch (error) {
      ErrorLogger.error('Failed to delete alert rule', error as Error);
      throw error;
    }
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  getRulesByMetric(metricType: MetricType): AlertRule[] {
    return Array.from(this.rules.values()).filter(
      rule => rule.metricType === metricType && rule.enabled
    );
  }

  onRuleChange(callback: (event: AlertRuleEvent) => void): () => void {
    this.on('ruleChange', callback);
    return () => this.off('ruleChange', callback);
  }
}

export const alertRulesService = AlertRulesService.getInstance(); 