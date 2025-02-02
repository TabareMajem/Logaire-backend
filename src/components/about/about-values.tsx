"use client";

import { Shield, Zap, Heart, Scale } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'We protect your data with enterprise-grade security.'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Constantly improving our platform with cutting-edge technology.'
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your success is our success. We\'re here to help you grow.'
  },
  {
    icon: Scale,
    title: 'Transparency',
    description: 'Clear pricing and honest communication in everything we do.'
  }
];

export function AboutValues() {
  return (
    <div className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
          <p className="text-lg text-muted-foreground">
            The principles that guide us in building the future of freight management
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}