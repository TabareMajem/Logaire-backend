"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';

export function DemoButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleDemoAccess = async () => {
    setIsLoading(true);
    try {
      await signIn('demo@freightflow.com', 'demo123456');
      toast.success('Welcome to the demo account!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to access demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleDemoAccess}
      variant="secondary"
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <PlayCircle className="mr-2 h-4 w-4" />
      )}
      Try Demo Account
    </Button>
  );
}
