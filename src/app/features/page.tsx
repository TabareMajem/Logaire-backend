"use client";

import { FeaturesHeader } from '@/components/features/features-header';
import { FeatureGrid } from '@/components/features/feature-grid';
import { UseCases } from '@/components/features/use-cases';
import { BenefitsSection } from '@/components/features/benefits-section';
import { Comparison } from '@/components/features/comparison';
import { CTASection } from '@/components/features/cta-section';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <FeaturesHeader />
      <FeatureGrid />
      <UseCases />
      <BenefitsSection />
      <Comparison />
      <CTASection />
    </div>
  );
}