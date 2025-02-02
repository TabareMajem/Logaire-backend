"use client";

import { JSX, Key } from 'react';
import { FeatureCard } from './feature-card';
import { Feature, FeatureCategoryProps } from '@/types/features';

export function FeatureCategory({ title, description, features }: FeatureCategoryProps) {
  return (
    <div>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature: JSX.IntrinsicAttributes & Feature, index: Key | null | undefined) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
}