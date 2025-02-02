"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../../components/ui/data-table';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ContentActions } from './content-actions';
import { Column } from 'react-table';

interface ContentListProps {
  filters: {
    search: string;
    type: string;
    status: string;
  };
}

export function ContentList({ filters }: ContentListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['content', filters],
    queryFn: async () => {
      let query = supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.type}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={
          row.original.status === 'published' ? 'outline' :
          row.original.status === 'draft' ? 'default' :
          'secondary'
        }>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: ({ row }: any) => (
        formatDistanceToNow(new Date(row.original.updated_at), { addSuffix: true })
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => <ContentActions content={row.original} />,
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