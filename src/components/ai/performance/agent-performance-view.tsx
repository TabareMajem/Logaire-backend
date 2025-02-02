"use client";

import { AgentPerformance } from '../dashboard/agent-performance';
import { AgentMetrics } from '../dashboard/agent-metrics';
import { Card } from '@/components/ui/card';

export function AgentPerformanceView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agent Performance</h1>
      
      <AgentMetrics agentId={''} />
      
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Performance Trends</h2>
        <AgentPerformance />
      </Card>
    </div>
  );
}