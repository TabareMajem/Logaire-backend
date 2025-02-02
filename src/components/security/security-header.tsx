"use client";

import { Shield } from 'lucide-react';

export function SecurityHeader() {
  return (
    <div className="relative py-20 bg-muted/50">
      <div className="container px-4 mx-auto text-center">
        <Shield className="w-12 h-12 mx-auto mb-8 text-primary" />
        <h1 className="text-4xl font-bold mb-4">Enterprise-Grade Security</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your data security and privacy are our top priorities. Learn about our comprehensive security measures.
        </p>
      </div>
    </div>
  );
}