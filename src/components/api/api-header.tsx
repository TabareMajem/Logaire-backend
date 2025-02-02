"use client";

import { Code } from 'lucide-react';

export function APIHeader() {
  return (
    <div className="relative py-20 bg-muted/50">
      <div className="container px-4 mx-auto text-center">
        <Code className="w-12 h-12 mx-auto mb-8 text-primary" />
        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Integrate FreightFlow&apos;s powerful shipping features directly into your applications
        </p>
      </div>
    </div>
  );
}