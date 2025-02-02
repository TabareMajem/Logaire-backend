"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SubscriptionService } from '@/lib/subscription/subscription-service';
import { LoadingPage } from '@/components/ui/loading';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: string;
}

export function SubscriptionGuard({ children, requiredPlan }: SubscriptionGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const subscriptionService = new SubscriptionService();

  useEffect(() => {
    async function checkAccess() {
      if (!user) return;

      const hasAccess = await subscriptionService.validateAccess(
        user.id,
        requiredPlan
      );

      if (!hasAccess) {
        router.push('/pricing');
      }
    }

    checkAccess();
  }, [user, requiredPlan, router]);

  if (!user) return <LoadingPage />;

  return <>{children}</>;
}