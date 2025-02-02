"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroCTA() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
      <Button size="lg" className="animate-slide-up">
        <Link href="/auth/register">
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" className="animate-slide-up delay-100">
        <Link href="/contact">Book a Demo</Link>
      </Button>
    </div>
  );
}