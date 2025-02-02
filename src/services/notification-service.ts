import { Alert } from '@/types/monitoring';

class NotificationService {
  private static instance: NotificationService;
  private notificationPermission: NotificationPermission = 'default';

  private constructor() {
    this.requestPermission();
  }

  static getInstance(): NotificationService {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }

  private async requestPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  async showNotification(alert: Alert) {
    if (this.notificationPermission !== 'granted') return;

    const notification = new Notification('System Alert', {
      body: alert.message,
      icon: '/alert-icon.png',
      tag: alert.id,
      data: alert
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to alerts panel
      window.location.hash = 'alerts';
    };
  }

  async showToast(message: string, type: 'success' | 'error' | 'warning' = 'info') {
    // Implement toast notification logic
  }
}

export const notificationService = NotificationService.getInstance(); 