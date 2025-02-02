"use client";

import { Ship } from 'lucide-react';

export function FeaturesHeader() {
  return (
    <div className="relative py-20 bg-muted/50">
      <div className="container px-4 mx-auto text-center">
        <Ship className="w-12 h-12 mx-auto mb-8 text-primary" />
        <h1 className="text-4xl font-bold mb-4">Powerful Features for Modern Logistics</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to streamline your shipping operations and scale your business
        </p>
      </div>
    </div>
  );
}