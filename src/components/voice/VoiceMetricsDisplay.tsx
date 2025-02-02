"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useVoiceMetrics } from '@/hooks/use-voice-metrics';

export function VoiceMetricsDisplay() {
  const { data: metrics, isLoading } = useVoiceMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Provide fallback values for successRate and averageConfidence if metrics is undefined
  const successRate = metrics?.successRate ?? 0;
  const averageConfidence = metrics?.averageConfidence ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Interactions</p>
            <p className="text-2xl font-bold">{metrics?.totalInteractions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">
              {(successRate * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Duration</p>
            <p className="text-2xl font-bold">
              {metrics?.averageDuration?.toFixed(1)}s
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
            <p className="text-2xl font-bold">
              {(averageConfidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
