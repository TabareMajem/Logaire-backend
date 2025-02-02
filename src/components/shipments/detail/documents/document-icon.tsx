  // src/components/shipments/details/documents/document-icon.tsx

  import { FileText, FileSpreadsheet, FileImage, Package, File } from 'lucide-react';
  import { cn } from '@/lib/utils';

  type DocumentType = 'invoice' | 'packing_list' | 'certificate' | 'customs' | 'other';

  interface DocumentIconProps {
    type: DocumentType | string;  // Allow string to handle unknown types dynamically
    className?: string;
  }

  const iconMap = {
    invoice: FileText,
    packing_list: FileSpreadsheet,
    certificate: FileImage,
    customs: Package,
    other: File,
  } as const;

  export function DocumentIcon({ type, className }: DocumentIconProps) {
    const Icon = iconMap[type as keyof typeof iconMap] || File;  // Cast type to avoid TS error

    return <Icon className={cn('text-foreground', className)} />;
  }
