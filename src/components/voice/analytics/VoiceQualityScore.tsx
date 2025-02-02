"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import { useVoiceMetrics } from '@/hooks/use-voice-metrics';

export function VoiceQualityScore() {
  const { data: metrics } = useVoiceMetrics();
  const qualityScore = (metrics?.averageConfidence || 0) * 100;

  const getQualityLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">{qualityScore.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">
              {getQualityLabel(qualityScore)}
            </p>
          </div>
          <Progress 
            value={qualityScore} 
            className={getQualityColor(qualityScore)}
          />
          <p className="text-xs text-muted-foreground">
            Based on voice recognition confidence and user feedback
          </p>
        </div>
      </CardContent>
    </Card>
  );
}