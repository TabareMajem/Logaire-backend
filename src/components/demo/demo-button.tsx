"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DemoService } from '@/lib/auth/demo-service';
import { Loader2, PlayCircle } from 'lucide-react';

interface DemoButtonProps {
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function DemoButton({ size = 'default', className }: DemoButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDemoAccess = async () => {
    setIsLoading(true);
    try {
      await DemoService.createDemoSession();
      toast.success('Welcome to the demo account!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to access demo account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDemoAccess}
      disabled={isLoading}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Accessing Demo...
        </>
      ) : (
        <>
          <PlayCircle className="mr-2 h-5 w-5" />
          Try Demo Account
        </>
      )}
    </Button>
  );
}