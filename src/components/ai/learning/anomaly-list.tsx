"use client";

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Badge } from '../../../../components/ui/badge';

interface Anomaly {
  id: string;
  metric: string;
  severity: 'low' | 'medium' | 'high';
  value: number;
  expected: number;
  deviation: number;
  timestamp: Date;
}

export function AnomalyList() {
  const { data: anomalies, isLoading } = useQuery({
    queryKey: ['anomalies'],
    queryFn: async () => {
      // Fetch anomalies implementation
      return [] as Anomaly[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!anomalies?.length) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No anomalies detected
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <AlertTriangle className={`h-5 w-5 ${
              anomaly.severity === 'high' ? 'text-red-500' :
              anomaly.severity === 'medium' ? 'text-yellow-500' :
              'text-blue-500'
            }`} />
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{anomaly.metric}</p>
                <Badge variant={
                  anomaly.severity === 'high' ? 'destructive' :
                  anomaly.severity === 'medium' ? 'default' :
                  'secondary'
                }>
                  {anomaly.severity}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Value: {anomaly.value.toFixed(2)} (Expected: {anomaly.expected.toFixed(2)})
              </p>
              
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(anomaly.timestamp))} ago
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}