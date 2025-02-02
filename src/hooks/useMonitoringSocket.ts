// src/hooks/useMonitoringSocket.ts -->

import { MonitoringEvent } from '@/types/next';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

interface UseMonitoringSocketReturn {
  subscribe: (events: string[], callback: (data: MonitoringEvent) => void) => void;
  unsubscribe: (events: string[]) => void;
  isConnected: boolean;
  error: Error | null;
}

export function useMonitoringSocket(): UseMonitoringSocketReturn {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!session?.access_token) return;

    try {
      socket.current = io('/monitoring', {
        path: '/api/monitoring/socket',
        auth: {
          token: session.access_token
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.current.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      socket.current.on('connect_error', (err) => {
        setError(err);
        setIsConnected(false);
        showToast({
          type: 'error',
          message: 'Failed to connect to monitoring service'
        });
      });

      socket.current.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server disconnected the client
          showToast({
            type: 'warning',
            message: 'Disconnected from monitoring service'
          });
        }
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    } catch (err) {
      setError(err as Error);
      showToast({
        type: 'error',
        message: 'Error initializing monitoring connection'
      });
    }
  }, [session?.access_token]);

  const subscribe = (events: string[], callback: (data: MonitoringEvent) => void) => {
    if (!socket.current) return;

    events.forEach(event => {
      socket.current?.on(event, (data: MonitoringEvent) => {
        try {
          callback(data);
        } catch (err) {
          setError(err as Error);
          showToast({
            type: 'error',
            message: `Error processing ${event} event`
          });
        }
      });
    });
  };

  const unsubscribe = (events: string[]) => {
    if (!socket.current) return;
    events.forEach(event => {
      socket.current?.off(event);
    });
  };

  return {
    subscribe,
    unsubscribe,
    isConnected,
    error
  };
} 