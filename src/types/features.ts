// src/types/features.ts

import { LucideIcon } from 'lucide-react';

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FeatureCategory {
  id: string;
  title: string;
  description: string;
  features: Feature[];
}

// Define FeatureCategoryProps to be used in the component
export interface FeatureCategoryProps {
  title: string;
  description: string;
  features: Feature[];
}
