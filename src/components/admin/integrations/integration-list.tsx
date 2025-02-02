// src/components/admin/integrations/integration-list.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../../components/ui/data-table';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { IntegrationActions } from './integration-actions';
import { Column } from 'react-table';

interface IntegrationListProps {
  filters: {
    search: string;
    type: string;
    status: string;
  };
}

export function IntegrationList({ filters }: IntegrationListProps) {

  const { data, isLoading } = useQuery({
    queryKey: ['integrations', filters],
    queryFn: async () => {
      let query = supabase
        .from('carrier_integrations')
        .select(`
          *,
          carrier:carrier_configurations(name)
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`carrier.name.ilike.%${filters.search}%`);
      }
      if (filters.type) {
        query = query.eq('api_type', filters.type);
      }
      if (filters.status) {
        query = query.eq('active', filters.status === 'active');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const columns = [
    {
      accessorKey: 'carrier.name',
      header: 'Carrier',
    },
    {
      accessorKey: 'api_type',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.api_type}</Badge>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.active ? 'destructive' : 'secondary'}>
          {row.original.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'last_sync',
      header: 'Last Sync',
      cell: ({ row }: any) => (
        row.original.last_sync ? 
          formatDistanceToNow(new Date(row.original.last_sync), { addSuffix: true }) :
          'Never'
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => <IntegrationActions integration={row.original} />,
    }
  ];

  return (
    <DataTable
      columns={columns as Column<any>[]}
      data={data || []}
      loading={isLoading}
    />
  );
}