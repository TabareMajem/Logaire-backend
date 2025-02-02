"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Feature } from '@/types/features';

export function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-background to-muted">
      <CardContent className="p-6">
        <Icon className="h-10 w-10 text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}