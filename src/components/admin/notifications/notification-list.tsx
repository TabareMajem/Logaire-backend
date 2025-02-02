"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../../components/ui/data-table';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { NotificationActions } from './notification-actions';
import { Column } from 'react-table';

interface NotificationListProps {
  filters: {
    search: string;
    type: string;
    severity: string;
  };
}

export function NotificationList({ filters }: NotificationListProps) {
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', filters],
    queryFn: async () => {
      let query = supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
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
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }: any) => (
        <Badge variant={
          row.original.severity === 'error' ? 'secondary' :
          row.original.severity === 'destructive' ? 'destructive' :
          'default'
        }>
          {row.original.severity}
        </Badge>
      ),
    },
    {
      accessorKey: 'read',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.read ? 'secondary' : 'default'}>
          {row.original.read ? 'Read' : 'Unread'}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: any) => (
        formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => <NotificationActions notification={row.original} />,
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