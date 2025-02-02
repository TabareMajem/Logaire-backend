// src/app/marketing/page.tsx -->

"use client";

import { ModernHero } from '@/components/marketing/sections/hero';
import { Features } from '@/components/marketing/sections/features';
import { Solutions } from '@/components/marketing/sections/solutions';
import { Testimonials } from '@/components/marketing/sections/testimonials';
import { Partners } from '@/components/marketing/sections/partners';
import { CTASection } from '@/components/marketing/sections/cta';

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ModernHero />
      <Features />
      <Solutions />
      <Testimonials />
      <Partners />
      <CTASection />
    </div>
  );
}