"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { AgentConfiguration } from './agent-configuration';
import { AgentList } from './agent-list';
import { AgentMetrics } from './agent-metrics';
import { AgentPerformance } from './agent-performance';

export function AgentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">AI Agents Dashboard</h2>
      </div>

      <AgentMetrics agentId={''} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AgentList />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <AgentPerformance />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <AgentConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}