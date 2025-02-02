"use client";

import { DemoButton } from './demo-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DemoAccess() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container px-4 mx-auto">
        <Card className="max-w-2xl mx-auto border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">
              Try FreightFlow Demo
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Experience all features instantly with our demo account
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <DemoButton size="lg" className="w-full sm:w-auto" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Included Features:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Full dashboard access
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Sample shipments and bookings
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Document management
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Advanced Features:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> AI-powered features
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Analytics and reporting
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-primary mr-2">✓</span> Real-time tracking
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}