// src/components/webhooks/webhook-list.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../components/ui/data-table';
import { Badge } from '../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { WebhookActions } from './webhook-actions';
import { Column } from 'react-table';

// Define the Webhook type (if you don't have this type already)
interface Webhook {
  id: string;  
  name: string;
  url: string;
  events: string[];
  status: string;
  created_at: string;
}

export function WebhookList() {
  const { data: webhooks, isLoading } = useQuery<Webhook[]>({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'url',
      header: 'Endpoint URL'
    },
    {
      accessorKey: 'events',
      header: 'Events',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <div className="flex gap-1">
          {row.original.events.map((event: string) => (
            <Badge key={event} variant="outline">{event}</Badge>
          ))}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <Badge variant={row.original.status === 'active' ? 'secondary' : 'default'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: Webhook } }) => formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Webhook } }) => <WebhookActions webhook={row.original} />
    }
  ];

  return (
    <DataTable
      columns={columns as Column<Webhook>[]}
      data={webhooks || []}
      loading={isLoading}
    />
  );
}
