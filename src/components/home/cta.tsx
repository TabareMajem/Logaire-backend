"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container px-4 mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Air Cargo Operations?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80">
            Experience the full power of LogiAire with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/login">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" 
              asChild
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70">
            No credit card required • Full access to all features
          </p>
        </div>
      </div>
    </section>
  );
}