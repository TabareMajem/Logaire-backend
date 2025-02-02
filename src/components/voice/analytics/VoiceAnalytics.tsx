"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceMetricsChart } from './VoiceMetricsChart';
import { VoiceUsageStats } from './VoiceUsageStats';
import { VoiceQualityScore } from './VoiceQualityScore';

export function VoiceAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Voice Analytics</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        <VoiceUsageStats />
        <VoiceQualityScore />
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceMetricsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}