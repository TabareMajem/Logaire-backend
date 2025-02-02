import { AlertTriangle, AlertOctagon, Info, CheckCircle } from 'lucide-react';
import { AlertType } from '@/lib/api/alerts';
import { cn } from '@/lib/utils';

interface AlertIconProps {
  type: AlertType;
  className?: string;
}

const iconMap = {
  warning: AlertTriangle,
  error: AlertOctagon,
  info: Info,
  success: CheckCircle,
} as const;

const colorMap = {
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  success: 'text-green-500',
} as const;

export function AlertIcon({ type, className }: AlertIconProps) {
  const Icon = iconMap[type];
  return <Icon className={cn(colorMap[type], className)} />;
}