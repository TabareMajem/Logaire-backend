// src/components/shipments/details/costs/cost-status.tsx -->

import { Badge } from '../../../../../components/ui/badge';

type Status = 'pending' | 'approved' | 'paid' | 'cancelled';

interface CostStatusProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: {
    label: 'Pending',
    variant: 'secondary'
  },
  approved: {
    label: 'Approved',
    variant: 'default'
  },
  paid: {
    label: 'Paid',
    variant: 'default'
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive'
  }
};

export function CostStatus({ status }: CostStatusProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}