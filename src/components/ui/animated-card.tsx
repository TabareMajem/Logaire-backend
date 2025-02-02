"use client";

import { forwardRef } from 'react';
import { Card } from '../../../components/ui/card';
import { cn } from '@/lib/utils';

export const AnimatedCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg',
        'hover:shadow-primary/10',
        className
      )}
      {...props}
    />
  );
});

AnimatedCard.displayName = 'AnimatedCard';