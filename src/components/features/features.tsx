"use client";

import { FeatureCategory } from './feature-category';
import { featureCategories } from '@/config/features';

export function Features() {
  return (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <div className="space-y-20">
          {featureCategories.map((category) => (
            <FeatureCategory 
              key={category.id}
              {...category}
            />
          ))}
        </div>
      </div>
    </div>
  );
}