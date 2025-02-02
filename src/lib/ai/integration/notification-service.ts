import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';
import { ShipmentOptimization } from '..';
import { Disruption } from '../types/disruption';

interface NotificationConfig {
  type: 'optimization' | 'disruption' | 'recovery';
  priority: 'low' | 'medium' | 'high';
  recipients: string[];
  channels: Array<'email' | 'sms' | 'notification'>;
}

export class NotificationService {
  private supabase = supabase;

  async sendOptimizationNotification(
    shipmentId: string,
    optimization: ShipmentOptimization,
    config: NotificationConfig
  ): Promise<void> {
    try {
      // const notification = this.createOptimizationNotification(
      //   shipmentId,
      //   optimization
      // );

      // await this.sendNotifications(notification, config);
    } catch (error) {
      ErrorLogger.error('Failed to send optimization notification', error as Error);
      throw error;
    }
  }

  async sendDisruptionAlert(
    shipmentId: string,
    disruption: Disruption,
    config: NotificationConfig
  ): Promise<void> {
    try {
      // const notification = this.createDisruptionNotification(
      //   shipmentId,
      //   disruption
      // );

      // await this.sendNotifications(notification, config);
    } catch (error) {
      ErrorLogger.error('Failed to send disruption alert', error as Error);
      throw error;
    }
  }

  // private createOptimizationNotification(
  //   shipmentId: string,
  //   optimization: ShipmentOptimization
  // ): Notification {
  //   return {
  //     title: 'Shipment Optimization Complete',
  //     message: `Optimization completed for shipment ${shipmentId} with ${
  //       optimization.summary.recommendations.length
  //     } recommendations`,
  //     data: {
  //       shipmentId,
  //       confidence: optimization.summary.confidence,
  //       warnings: optimization.summary.warnings
  //     }
  //   };
  // }

  // private createDisruptionNotification(
  //   shipmentId: string,
  //   disruption: Disruption
  // ): Notification {
  //   return {
  //     title: 'Shipment Disruption Alert',
  //     message: `${disruption.type} disruption affecting shipment ${shipmentId}`,
  //     data: {
  //       shipmentId,
  //       disruptionType: disruption.type,
  //       severity: disruption.severity,
  //       location: disruption.location.name
  //     }
  //   };
  // }

  private async sendNotifications(
    notification: Notification,
    config: NotificationConfig
  ): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .insert({
        ...notification,
        priority: config.priority,
        recipients: config.recipients,
        channels: config.channels,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}