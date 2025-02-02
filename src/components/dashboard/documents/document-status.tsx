import { Badge } from '../../../../components/ui/badge';
import type { DocumentStatus } from '@/lib/api/documents';

interface DocumentStatusProps {
  status: DocumentStatus; // Ensure that status is strictly typed
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' },
  final: { label: 'Final', variant: 'default' },
  signed: { label: 'Signed', variant: 'destructive' },
  // Add other status keys if needed
} as const; // `as const` ensures the values are inferred as literal types

export function DocumentStatus({ status }: DocumentStatusProps) {
  // Ensure the status is a valid key for statusConfig
  const config = statusConfig[status as keyof typeof statusConfig]; // Cast status to ensure it's a valid key

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}