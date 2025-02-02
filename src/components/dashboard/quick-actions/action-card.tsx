"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickAction } from '@/lib/config/quick-actions';

interface ActionCardProps {
  action: QuickAction;
}

export function ActionCard({ action }: ActionCardProps) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className={cn(
        "group relative rounded-lg p-6 hover:bg-muted transition-colors",
        "flex items-center space-x-4"
      )}
    >
      <div className={cn(
        "p-2 rounded-full",
        action.color,
        "transition-transform group-hover:scale-110"
      )}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{action.title}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {action.description}
        </p>
      </div>
      
      <ChevronRight 
        className="h-5 w-5 text-muted-foreground/50 
                   group-hover:text-muted-foreground/70 
                   transition-colors" 
      />
    </Link>
  );
}