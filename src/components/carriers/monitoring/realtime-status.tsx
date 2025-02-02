"use client";

import { useCarrierRealtime } from '@/hooks/use-carrier-realtime';
import { Badge } from '../../../../components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export function RealtimeStatus() {
  const { isConnected } = useCarrierRealtime();

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <Badge variant="outline" className="bg-green-500/10 text-green-500">
          <Wifi className="mr-1 h-3 w-3" />
          Real-time Connected
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-destructive/10 text-destructive">
          <WifiOff className="mr-1 h-3 w-3" />
          Real-time Disconnected
        </Badge>
      )}
    </div>
  );
}