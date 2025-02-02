"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { useVoiceMetrics } from '@/hooks/use-voice-metrics';

export function VoiceUsageStats() {
  const { data: metrics } = useVoiceMetrics();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Commands</p>
            <p className="text-2xl font-bold">{metrics?.totalInteractions || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Duration</p>
            <p className="text-2xl font-bold">
              {metrics?.averageDuration?.toFixed(1) || 0}s
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recognition Rate</p>
            <p className="text-2xl font-bold">
              {((metrics?.successRate || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}