// src/hooks/useWebSocket.ts -->

import { websocketService } from '@/services/websocket-service';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

interface UseWebSocketOptions {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: (attempt: number) => void;
  onReconnectFailed?: () => void;
  channel?: string; 
}

export function useWebSocket(options: UseWebSocketOptions = {}) {

  const normalizedOptions: UseWebSocketOptions = typeof options === 'string' 
    ? { channel: options }
    : options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();
  const { showToast } = useToast();
  const optionsRef = useRef(options);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    optionsRef.current = options;
  }, [normalizedOptions]);

  useEffect(() => {
    if (!session?.access_token) return;

    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
      optionsRef.current.onConnected?.();
    };

    const handleDisconnected = (reason: string) => {
      setIsConnected(false);
      optionsRef.current.onDisconnected?.();
      showToast({
        type: 'warning',
        message: 'Disconnected from monitoring service'
      });
    };

    const handleReconnecting = (attempt: number) => {
      optionsRef.current.onReconnecting?.(attempt);
      showToast({
        type: 'info',
        message: `Attempting to reconnect (${attempt}/5)...`
      });
    };

    const handleReconnectFailed = () => {
      optionsRef.current.onReconnectFailed?.();
      showToast({
        type: 'error',
        message: 'Failed to reconnect to monitoring service'
      });
    };

    const handleError = (err: Error) => {
      setError(err);
      showToast({
        type: 'error',
        message: 'Monitoring service error'
      });
    };

    // Set up event listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('reconnecting', handleReconnecting);
    websocketService.on('reconnect_failed', handleReconnectFailed);
    websocketService.on('error', handleError);
    // Initialize connection
    // websocketService.connect(session.access_token).catch(handleError);

    return () => {
      websocketService.removeListener('connected', handleConnected);
      websocketService.removeListener('disconnected', handleDisconnected);
      websocketService.removeListener('reconnecting', handleReconnecting);
      websocketService.removeListener('reconnect_failed', handleReconnectFailed);
      websocketService.removeListener('error', handleError);
    };
  }, [session?.access_token]);

  // const subscribe = <T,>(event: string, callback: (data: T) => void) => {
  //   if (!isConnected) {
  //     throw new Error('WebSocket not connected');
  //   }
  //   return websocketService.subscribe(event, callback);
  // };

  // const publish = <T,>(event: string, data: T) => {
  //   if (!isConnected) {
  //     throw new Error('WebSocket not connected');
  //   }
  //   websocketService.publish(event, data);
  // };

  const subscribe = <T,>(event: string, callback: (data: T) => void) => {
    if (!isConnected) {
      throw new Error('WebSocket not connected');
    }
    const unsubscribe = websocketService.subscribe(event, callback);
    subscriptionsRef.current.set(event, unsubscribe);
    return unsubscribe;
  };

  const publish = <T,>(event: string, data: T) => {
    if (!isConnected) {
      throw new Error('WebSocket not connected');
    }
    websocketService.publish(event, data);
  };

  const unsubscribe = (event: string) => {
    const unsubscribeFunc = subscriptionsRef.current.get(event);
    if (unsubscribeFunc) {
      unsubscribeFunc();
      subscriptionsRef.current.delete(event);
    }
  };

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe, // Add unsubscribe to returned object
    publish
  };

} 