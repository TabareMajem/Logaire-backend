// src/components/admin/integrations/IntegrationList.tsx -->

import { Badge } from '../../../../components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../components/ui/table';
import { Integration } from '@/types/integrations';
import { formatDistanceToNow } from 'date-fns';

interface IntegrationListProps {
  integrations: Integration[];
  onSelect: (integration: Integration) => void;
  onDelete: (id: string) => void;
}

export function IntegrationList({
  integrations,
  onSelect,
  onDelete,
}: IntegrationListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Sync</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {integrations.map((integration) => (
          <TableRow
            key={integration.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelect(integration)}
          >
            <TableCell className="font-medium">
              {integration.name}
            </TableCell>
            <TableCell>{integration.type}</TableCell>
            <TableCell>
              <Badge
                variant={
                  integration.status === 'active'
                    ? 'default'
                    : integration.status === 'inactive'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {integration.status}
              </Badge>
            </TableCell>
            <TableCell>
              {integration.lastSync
                ? formatDistanceToNow(new Date(integration.lastSync), {
                    addSuffix: true,
                  })
                : 'Never'}
            </TableCell>
            <TableCell>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(integration.id);
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