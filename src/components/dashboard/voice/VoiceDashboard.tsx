"use client";

import { VoiceControl } from '@/components/voice/VoiceControl';
import { VoiceMetrics } from './VoiceMetrics';
import { VoiceHistory } from './VoiceHistory';

export function VoiceDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Voice Controls</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <VoiceControl />
        <VoiceMetrics />
      </div>
      
      <VoiceHistory />
    </div>
  );
}