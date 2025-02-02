"use client";

import { Badge } from '../../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { Pause, Play, Settings } from 'lucide-react';
import { useState } from 'react';
import { AgentConfigDialog } from './agent-config-dialog';

export function AgentList() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('/api/ai/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    }
  });

  if (isLoading) {
    return <div>Loading agents...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents?.map((agent: any) => (
              <TableRow key={agent.type}>
                <TableCell className="font-medium">{agent.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={agent.active ? "secondary" : "default"}
                  >
                    {agent.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{agent.taskCount}</TableCell>
                <TableCell>{agent.successRate}%</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Toggle agent status
                    }}
                  >
                    {agent.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAgent(agent.type)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AgentConfigDialog
        open={!!selectedAgent}
        onOpenChange={() => setSelectedAgent(null)}
        agentType={selectedAgent}
      />
    </div>
  );
}