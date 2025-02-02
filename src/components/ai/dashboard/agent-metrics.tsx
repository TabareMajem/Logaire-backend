// src/components/ai/dashboard/agent-metrics.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Activity, AlertTriangle } from 'lucide-react';

interface AgentMetricsProps {
  agentId: string;
}

export function AgentMetrics({ agentId }: AgentMetricsProps) {

  const { data: metrics } = useQuery({
    queryKey: ['ai-metrics', agentId], // Add agentId to the query key if needed
    queryFn: async () => ({
      activeAgents: 5,
      successRate: 98.5,
      averageLatency: 245,
      errorRate: 0.5
    })
  });

  // const { data: metrics } = useQuery({
  //   queryKey: ['ai-metrics'],
  //   queryFn: async () => ({
  //     activeAgents: 5,
  //     successRate: 98.5,
  //     averageLatency: 245,
  //     errorRate: 0.5
  //   })
  // });

  const cards = [
    {
      title: 'Active Agents',
      value: metrics?.activeAgents || 0,
      icon: Brain,
      description: 'Currently running agents'
    },
    {
      title: 'Success Rate',
      value: `${metrics?.successRate.toFixed(1)}%` || '0%',
      icon: Zap,
      description: 'Task completion rate'
    },
    {
      title: 'Avg. Latency',
      value: `${metrics?.averageLatency}ms` || '0ms',
      icon: Activity,
      description: 'Response time'
    },
    {
      title: 'Error Rate',
      value: `${metrics?.errorRate.toFixed(1)}%` || '0%',
      icon: AlertTriangle,
      description: 'Failed operations'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}