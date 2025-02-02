"use client";

import { PricingHeader } from '@/components/pricing/pricing-header';
import { PricingSection } from '@/components/pricing/pricing-section';
import { PricingFAQ } from '@/components/pricing/pricing-faq';
import { CTASection } from '@/components/marketing/sections/cta';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PricingHeader />
      <PricingSection />
      <PricingFAQ />
      <CTASection />
    </div>
  );
}