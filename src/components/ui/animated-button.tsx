"use client";

import { forwardRef } from 'react';
import { Button, ButtonProps } from '../../../components/ui/button';
import { cn } from '@/lib/utils';

export interface AnimatedButtonProps extends ButtonProps {
  glowColor?: string;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, glowColor = 'primary', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          'hover:shadow-lg hover:scale-[1.02]',
          `hover:shadow-${glowColor}/20`,
          'active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
AnimatedButton.displayName = 'AnimatedButton';