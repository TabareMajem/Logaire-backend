import { OptimizationManager } from './optimization-manager';
import { MonitoringService } from './monitoring-service';
import { NotificationService } from './notification-service';
import { ErrorLogger } from '@/lib/errors/logger';
import { AIAgentContext } from '../types';

export class OptimizationOrchestrator {
  private manager: OptimizationManager;
  private monitor: MonitoringService;
  private notifications: NotificationService;

  constructor(context: AIAgentContext) {
    this.manager = new OptimizationManager(context);
    this.monitor = new MonitoringService(context);
    this.notifications = new NotificationService();
  }

  async optimizeAndMonitor(shipmentId: string): Promise<void> {
    try {
      // Run initial optimization
      const optimization = await this.manager.optimizeShipment(shipmentId);

      // Send notifications
      await this.notifications.sendOptimizationNotification(
        shipmentId,
        optimization,
        {
          type: 'optimization',
          priority: 'medium',
          recipients: await this.getRecipients(shipmentId),
          channels: ['notification']
        }
      );

      // Start monitoring
      await this.monitor.monitorActiveShipments();
    } catch (error) {
      ErrorLogger.error('Optimization and monitoring failed', error as Error);
      throw error;
    }
  }

  private async getRecipients(shipmentId: string): Promise<string[]> {
    // Implementation
    return [];
  }
}