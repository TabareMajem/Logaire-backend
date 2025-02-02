"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ShellProps {
  title: string;
  description: string;
  href: string;
  linkText: string;
  children: React.ReactNode;
}

export function Shell({ title, description, href, linkText, children }: ShellProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        <div className="mt-4 text-center text-sm">
          <Link href={href} className="text-muted-foreground hover:text-primary">
            {linkText}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}