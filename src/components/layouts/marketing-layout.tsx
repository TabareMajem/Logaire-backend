"use client";

import { ModernNavbar } from '@/components/layout/modern-navbar';
import { Footer } from '@/components/layout/footer';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <ModernNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}