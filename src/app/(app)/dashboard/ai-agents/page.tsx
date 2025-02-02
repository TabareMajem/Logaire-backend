// src/app/(app)/dashboard/ai-agents/page.tsx -->

"use client";

import { AgentList } from '@/components/ai/dashboard/agent-list';
import { AgentMetrics } from '@/components/ai/dashboard/agent-metrics';
import { AgentPerformance } from '@/components/ai/dashboard/agent-performance';
import { AgentDashboard } from '@/components/ai/dashboard/agent-dashboard';

export default function AIAgentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <AgentDashboard />
    </div>
  );
}