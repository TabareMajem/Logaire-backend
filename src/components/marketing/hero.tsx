"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MarketingHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-background" />
      
      <div className="container relative px-4 mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          AI-Powered
          <span className="text-primary block mt-2">Air Freight</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Transform your air cargo operations with intelligent automation, real-time tracking, and predictive analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/login">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}