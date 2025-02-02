// // src/components/layouts/admin-layout.tsx

"use client";

import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/layout/sidebar';
import { AdminHeader } from '@/components/admin/layout/header';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
