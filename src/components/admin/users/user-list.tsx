// src/components/admin/users/user-list.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../../components/ui/data-table';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { UserActions } from './user-actions';
import { Column } from 'react-table';

interface UserListProps {
  filters: {
    search: string;
    role: string;
    status: string;
  };
}

export function UserList({ filters }: UserListProps) {

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
      }
      if (filters.role) {
        query = query.eq('role', filters.role);
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
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        `${row.original.first_name} ${row.original.last_name}`
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.role}</Badge>
      ),
    },
    {
      accessorKey: 'last_login',
      header: 'Last Login',
      cell: ({ row }: any) => (
        row.original.last_login_at ? 
          formatDistanceToNow(new Date(row.original.last_login_at), { addSuffix: true }) :
          'Never'
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => <UserActions user={row.original} />,
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