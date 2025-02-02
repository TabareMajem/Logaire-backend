// src/components/notifications/AlertNotificationSystem.tsx -->

import { Alert as Alerts, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Button } from '@/components/ui/button';
import { Toast } from '../../../components/ui/toast';
import { useAlerts } from '@/hooks/useAlerts';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert } from '@/types/monitoring';
import { AlertSeverity } from '@/types/monitoring';

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
}

interface SystemAlert {
  id: string;
  type: string;
  message: string;
  severity: AlertSeverity;
}

export function AlertNotificationSystem() {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const { subscribeToAlerts, acknowledgeAlert } = useAlerts();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupSubscription = async () => {
    const unsubscribe = await subscribeToAlerts((alert: Alert) => {
    const notification: AlertNotification = {
      id: alert.id,
      title: alert.type || 'Alert', // Use a fallback title if `type` doesn't exist
      message: alert.message,
      severity: alert.severity,
      timestamp: new Date().toISOString()
    };

    setNotifications((prev) => [notification, ...prev]);

    if (alert.severity === 'critical') {
      Toast({
        title: 'Critical Alert',
        variant: 'destructive',
        duration: 0
      });
    }

    if (alert.severity === 'critical' || alert.severity === 'error') {
      playAlertSound(alert.severity);
    }
  });

  cleanup = unsubscribe;
};

    setupSubscription();

    return () => {
      cleanup?.();
    };
  }, [subscribeToAlerts]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      removeNotification(id);
    } catch (error) {
      Toast({
        title: 'Error',
        // description: 'Failed to acknowledge alert',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 space-y-4 max-w-sm">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
            >
              <Alerts
                variant={getAlertVariant(notification.severity)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <AlertTitle>{notification.title}</AlertTitle>
                <AlertDescription>{notification.message}</AlertDescription>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(notification.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Alerts>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function getAlertVariant(severity: AlertSeverity): 'default' | 'destructive' {
  switch (severity) {
    case 'critical':
    case 'error':
      return 'destructive';
    default:
      return 'default';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

function playAlertSound(severity: AlertSeverity) {
  const audio = new Audio(
    severity === 'critical'
      ? '/sounds/critical-alert.mp3'
      : '/sounds/error-alert.mp3'
  );
  audio.play().catch(() => {
    // Ignore autoplay errors
  });
} 