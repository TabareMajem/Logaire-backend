// src/app/demo/page.tsx -->

"use client";

import { DemoHeader } from '@/components/demo/demo-header';
import { DemoMetrics } from '@/components/demo/demo-metrics';
import { DemoShipments } from '@/components/demo/demo-shipments';
import { DemoActivity } from '@/components/demo/demo-activity';
import { DemoFeatures } from '@/components/demo/demo-features';
import { DemoCTA } from '@/components/demo/demo-cta';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <DemoHeader />
      
      <div className="container mx-auto px-4 py-12 space-y-16">
        <DemoMetrics />
        
        <div className="grid lg:grid-cols-2 gap-8">
          <DemoShipments />
          <DemoActivity />
        </div>
        
        <DemoFeatures />
        <DemoCTA />
      </div>
    </div>
  );
}