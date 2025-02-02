"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DataTable } from '../../../../components/ui/data-table';
import { Badge } from '../../../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/utils/format';
import { SubscriptionActions } from './subscription-actions';
import { Column } from 'react-table';

interface SubscriptionListProps {
  filters: {
    search: string;
    status: string;
    plan: string;
  };
}

export function SubscriptionList({ filters }: SubscriptionListProps) {

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          company:companies(name),
          plan:subscription_plans(name, price)
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`company.name.ilike.%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.plan) {
        query = query.eq('plan_id', filters.plan);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const columns = [
    {
      accessorKey: 'company.name',
      header: 'Company',
    },
    {
      accessorKey: 'plan.name',
      header: 'Plan',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={
          row.original.status === 'active' ? 'secondary' :
          row.original.status === 'past_due' ? 'destructive' :
          'default'
        }>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'plan.price',
      header: 'Amount',
      cell: ({ row }: any) => formatCurrency(row.original.plan.price, 'USD'),
    },
    {
      accessorKey: 'current_period_end',
      header: 'Next Billing',
      cell: ({ row }: any) => (
        formatDistanceToNow(new Date(row.original.current_period_end), { addSuffix: true })
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => <SubscriptionActions subscription={row.original} />,
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