import { Icons } from '@/components/ui/icons';
import { ActivityType } from '@/lib/api/activity';
import { cn } from '@/lib/utils';

interface ActivityTypeIconProps {
  type: ActivityType;
  className?: string;
}

export function ActivityTypeIcon({ type, className }: ActivityTypeIconProps) {
  const iconMap: Record<ActivityType, keyof typeof Icons> = {
    shipment: 'ship',
    booking: 'calendar',
    document: 'fileText',
    system: 'settings',
  };

  const colorMap: Record<ActivityType, string> = {
    shipment: 'text-blue-500',
    booking: 'text-green-500',
    document: 'text-yellow-500',
    system: 'text-purple-500',
  };

  const Icon = Icons[iconMap[type]];

  return (
    <div className={cn(
      'rounded-full p-1 bg-background border',
      colorMap[type],
      className
    )}>
      <Icon className="h-3 w-3" />
    </div>
  );
}