import { useToast } from '@/hooks/useToast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { notificationService } from '@/services/notification-service';
import { Alert } from '@/types/monitoring';
import { useEffect } from 'react';

export function AlertNotifications() {
  const { subscribe } = useWebSocket();
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribe<Alert>('alerts:new', (alert) => {
      // Show browser notification
      notificationService.showNotification(alert);

      // Show toast notification
      showToast({
        type: alert.severity === 'high' ? 'error' : 
              alert.severity === 'medium' ? 'warning' : 'info',
        message: alert.message,
        duration: alert.severity === 'high' ? 10000 : 5000
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // This is a headless component that only handles notifications
  return null;
} 