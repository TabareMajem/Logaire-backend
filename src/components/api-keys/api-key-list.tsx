"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../components/ui/data-table';
import { Badge } from '../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { APIKeyActions } from './api-key-actions';
import React from "react";
import { Column } from 'react-table';

type APIKey = {
  id: string;
  name: string;
  key: string;
  status: string;
  created_at: string;
};

export function APIKeyList() {
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      
      const { data, error } = await supabase
        .from('api_keys')
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
      accessorKey: 'key',
      header: 'API Key',
      cell: ({ row }: { row: { original: APIKey } }) => (
        <code className="px-2 py-1 bg-muted rounded">
          {row.original.key.slice(0, 8)}...{row.original.key.slice(-4)}
        </code>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: APIKey } }) => (
        <Badge variant={row.original.status === 'active' ? 'secondary' : 'default'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: APIKey } }) =>
        formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: APIKey } }) => <APIKeyActions apiKey={row.original} />
    }
  ]; 

  return (
    <DataTable
      columns={columns as Column<any>[]}
      data={apiKeys || []}
      loading={isLoading}
    />
  );
}