import { ErrorLogger } from '@/lib/errors/logger';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertSeverity, AlertStatus } from '@/types/monitoring';
import { Alert as alert } from '../../../../components/ui/alert';
import { io } from 'socket.io-client';

export class AlertManager {
  getActiveAlerts(): SystemAlert[] | PromiseLike<SystemAlert[]> {
    throw new Error('Method not implemented.');
  }
  private static instance: AlertManager;
  private socket: ReturnType<typeof io> | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000;

  private constructor() {
    this.initializeSocket();
  }

  static getInstance(): AlertManager {
    if (!this.instance) {
      this.instance = new AlertManager();
    }
    return this.instance;
  }

  private initializeSocket() {
    try {
      this.socket = io('/monitoring', {
        path: '/api/monitoring/socket',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Alert manager connected to socket');
      });

      this.socket.on('error', (error) => {
        ErrorLogger.error('Alert manager socket error', error);
      });
    } catch (error) {
      ErrorLogger.error('Failed to initialize alert manager socket', error as Error);
    }
  }

  async getAlerts(params?: {
    status?: AlertStatus;
    severity?: AlertSeverity;
  }): Promise<Alert[]> {
    let attempt = 0;
    while (attempt < this.retryAttempts) {
      try {
        let query = supabase.from('alerts').select('*');

        if (params?.status) {
          query = query.eq('status', params.status);
        }
        if (params?.severity) {
          query = query.eq('severity', params.severity);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data as Alert[];
      } catch (error) {
        attempt++;
        if (attempt === this.retryAttempts) {
          ErrorLogger.error('Failed to fetch alerts', error as Error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
    throw new Error('Failed to fetch alerts after retries');
  }

  async createAlert(
    alert: Omit<Alert, 'id' | 'timestamp'>,
    notify: boolean = true
  ): Promise<void> {
    try {
      const newAlert = {
        ...alert,
        timestamp: new Date().toISOString(),
        status: 'active' as const
      };

      const { error } = await supabase.from('alerts').insert([newAlert]);
      if (error) throw error;

      if (notify && this.socket?.connected) {
        this.socket.emit('alert:new', newAlert);
      }
    } catch (error) {
      ErrorLogger.error('Failed to create alert', error as Error);
      throw error;
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'acknowledged',
          acknowledgedAt: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      if (this.socket?.connected) {
        this.socket.emit('alert:update', { id: alertId, status: 'acknowledged' });
      }
    } catch (error) {
      ErrorLogger.error('Failed to acknowledge alert', error as Error);
      throw error;
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      if (this.socket?.connected) {
        this.socket.emit('alert:update', { id: alertId, status: 'resolved' });
      }
    } catch (error) {
      ErrorLogger.error('Failed to resolve alert', error as Error);
      throw error;
    }
  }

  async subscribeToAlerts(callback: (alert: Alert) => void): Promise<() => void> {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    const handleNewAlert = (alert: Alert) => {
      try {
        callback(alert);
      } catch (error) {
        ErrorLogger.error('Error in alert subscription callback', error as Error);
      }
    };

    this.socket.on('alert:new', handleNewAlert);
    this.socket.on('alert:update', handleNewAlert);

    // Return unsubscribe function
    return () => {
      this.socket?.off('alert:new', handleNewAlert);
      this.socket?.off('alert:update', handleNewAlert);
    };
  }

  async evaluateMetricAlert(
    metricType: string,
    value: number,
    thresholds: {
      warning: number;
      critical: number;
    }
  ): Promise<void> {
    try {
      let severity: AlertSeverity | null = null;

      if (value >= thresholds.critical) {
        severity = 'high';
      } else if (value >= thresholds.warning) {
        severity = 'medium';
      }

      if (severity) {
        await this.createAlert({
          metric: metricType,
          condition: 'above',
          threshold: severity === 'high' ? thresholds.critical : thresholds.warning,
          value,
          severity,
          status: 'active',
          message: `${metricType} value ${value} exceeded ${severity} threshold`
        });
      }
    } catch (error) {
      ErrorLogger.error('Failed to evaluate metric alert', error as Error);
      throw error;
    }
  }
} 

export { Alert };
