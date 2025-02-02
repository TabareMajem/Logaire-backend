// src/components/shipments/details/documents/document-status.tsx -->

import { Badge } from '../../../../../components/ui/badge';

type Status = 'draft' | 'pending' | 'approved' | 'rejected' | 'pending_approval' | 'final';

interface DocumentStatusProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'}> = {
    draft: {
        label: 'Draft',
        variant: 'secondary'
    },
    pending: {
        label: 'Pending Review',
        variant: 'secondary'
    },
    approved: {
        label: 'Approved',
        variant: 'default'
    },
    rejected: {
        label: 'Rejected',
        variant: 'destructive'
    },
    pending_approval: {
        label: 'pending_approval',
        variant: 'outline'
    },
    final: {
        label: 'final',
        variant: 'default'
    }
};

export function DocumentStatus({ status }: DocumentStatusProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}