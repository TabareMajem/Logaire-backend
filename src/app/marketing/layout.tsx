"use client";

import { ModernNavbar } from '@/components/layout/modern-navbar';
import { Footer } from '@/components/layout/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ModernNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}