"use client";

import { Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    category: "AI Capabilities",
    items: [
      { name: "Route Optimization", traditional: false, freightflow: true },
      { name: "Predictive Analytics", traditional: false, freightflow: true },
      { name: "Risk Assessment", traditional: false, freightflow: true }
    ]
  },
  {
    category: "Automation",
    items: [
      { name: "Document Generation", traditional: true, freightflow: true },
      { name: "Workflow Automation", traditional: false, freightflow: true },
      { name: "Custom Triggers", traditional: false, freightflow: true }
    ]
  },
  {
    category: "Integration",
    items: [
      { name: "API Access", traditional: true, freightflow: true },
      { name: "Real-time Updates", traditional: false, freightflow: true },
      { name: "Multi-carrier Support", traditional: true, freightflow: true }
    ]
  }
];

export function Comparison() {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose FreightFlow?</h2>
          <p className="text-lg text-muted-foreground">
            See how we compare to traditional freight management solutions
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-3 text-sm">
              <div className="p-4 font-medium bg-muted/50">Features</div>
              <div className="p-4 font-medium text-center bg-muted/50">Traditional TMS</div>
              <div className="p-4 font-medium text-center bg-primary/10">FreightFlow</div>

              {features.map((category, i) => (
                <div key={i} className="contents">
                  <div className="col-span-3 p-4 font-medium bg-muted/20">
                    {category.category}
                  </div>
                  {category.items.map((item, j) => (
                    <div key={`${i}-${j}`} className="contents">
                      <div className="p-4 border-t">{item.name}</div>
                      <div className="p-4 border-t text-center">
                        {item.traditional ? (
                          <Check className="h-5 w-5 mx-auto text-green-500" />
                        ) : (
                          <X className="h-5 w-5 mx-auto text-red-500" />
                        )}
                      </div>
                      <div className="p-4 border-t text-center bg-primary/5">
                        <Check className="h-5 w-5 mx-auto text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}