"use client";

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Alert } from '@/lib/api/alerts';
import { AlertIcon } from './alert-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      !alert.read && "bg-muted/50"
    )}>
      <div className="flex items-start space-x-4">
        <AlertIcon type={alert.type} className="h-5 w-5 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{alert.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {alert.message}
          </p>
          {alert.action && (
            <Button
              variant="link"
              className="mt-2 h-auto p-0"
              asChild
            >
              <Link href={alert.action.href}>
                {alert.action.label}
              </Link>
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(alert.created_at))} ago
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => onDismiss(alert.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
}