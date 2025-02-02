// src/components/shipments/details/costs/cost-type-icon.tsx

import { Truck, Package, Building, Clipboard, FileText, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

type CostType = 'transport' | 'storage' | 'customs' | 'documentation' | 'insurance' | 'other' | 'freight';

interface CostTypeIconProps {
  type: CostType;
  className?: string;
}

// Add 'freight' to the iconMap
const iconMap = {
  transport: Truck,
  storage: Building,
  customs: Package,
  documentation: FileText,
  insurance: Clipboard,
  other: CircleDollarSign,
  freight: CircleDollarSign, // Add 'freight' here
} as const;

export function CostTypeIcon({ type, className }: CostTypeIconProps) {
  const Icon = iconMap[type] || CircleDollarSign; // Default to CircleDollarSign if not found
  
  return <Icon className={cn('text-foreground', className)} />;
}
