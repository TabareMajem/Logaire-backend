"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-background animate-gradient" />
      
      <div className="container relative px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              The Future of
              <span className="text-primary block mt-2 animate-gradient-text">Freight Management</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Transform your logistics operations with AI-powered tools, real-time tracking, and automated documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="animate-slide-up" asChild>
                <Link href="/auth/login">
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="animate-slide-up delay-100" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative animate-float">
            <div className="relative aspect-square max-w-xl mx-auto">
              <Image
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
                alt="Global logistics"
                width={800}
                height={800}
                className="rounded-lg shadow-2xl"
                priority
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-lg animate-float delay-100" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-lg animate-float delay-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}