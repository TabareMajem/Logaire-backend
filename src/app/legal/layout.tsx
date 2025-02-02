"use client";

import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 h-14">
            <Link href="/legal/privacy" className="text-sm hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-sm hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}