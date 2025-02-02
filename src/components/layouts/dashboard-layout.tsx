// // src/components/layouts/dashboard-layout.tsx

"use client";

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layouts/dashboard/sidebar';
import { TopNav } from '@/components/layouts/dashboard/top-nav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
