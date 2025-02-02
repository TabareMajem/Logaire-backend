"use client";

import Link from 'next/link';
import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Plane className="h-6 w-6" />
          <span className="font-bold">LogiAire</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/solutions" className="text-muted-foreground hover:text-foreground">
            Solutions
          </Link>
          <Link href="/features" className="text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}