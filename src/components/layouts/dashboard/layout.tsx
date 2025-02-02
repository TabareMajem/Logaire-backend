"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { DemoBanner } from './demo-banner';
import { PageLoader } from '../../../../components/ui/loading';
import { ErrorBoundary } from '@/components/layouts/error-boundary';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const isDemo = user?.user_metadata?.is_demo;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 overflow-auto p-6">
          {isDemo && <DemoBanner />}
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}