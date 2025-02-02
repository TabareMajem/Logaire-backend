import { Badge } from '../../../../components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface AgentListProps {
  agents: Array<{
    id: string;
    name: string;
    type: string;
    status: {
      status: 'idle' | 'processing' | 'error';
      performance?: {
        requestsProcessed: number;
        averageLatency: number;
        errorRate: number;
      };
    };
    lastActive: string;
  }>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AgentList({ agents, onSelect, onDelete }: AgentListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent) => (
          <TableRow
            key={agent.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelect(agent.id)}
          >
            <TableCell className="font-medium">{agent.name}</TableCell>
            <TableCell>{agent.type}</TableCell>
            <TableCell>
              <Badge
                variant={
                  agent.status.status === 'idle'
                    ? 'secondary'
                    : agent.status.status === 'processing'
                    ? 'default'
                    : 'destructive'
                }
              >
                {agent.status.status}
              </Badge>
            </TableCell>
            <TableCell>
              {agent.status.performance && (
                <div className="text-sm">
                  <div>Requests: {agent.status.performance.requestsProcessed}</div>
                  <div>Latency: {agent.status.performance.averageLatency}ms</div>
                  <div>Error Rate: {agent.status.performance.errorRate}%</div>
                </div>
              )}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(agent.id);
                }}
                className="text-sm text-destructive hover:text-destructive/80"
              >
                Delete
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
