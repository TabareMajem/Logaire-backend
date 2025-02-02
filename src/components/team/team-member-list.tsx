// src/components/team/team-member-list.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../components/ui/data-table';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { TeamMemberActions } from './team-member-actions';
import { Column } from 'react-table';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export function TeamMemberList() {
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Member[];
    },
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: { original: Member } }) => (
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={row.original.avatar_url} />
            <AvatarFallback>
              {row.original.first_name?.[0]}
              {row.original.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <span>
            {row.original.first_name} {row.original.last_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: { original: Member } }) => (
        <Badge variant="outline">{row.original.role}</Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Member } }) => <TeamMemberActions member={row.original} />,
    },
  ];

  return (
    <DataTable
      columns={columns as Column<Member>[]}
      data={members || []}
      loading={isLoading}
    />
  );
}
