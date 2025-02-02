// src/components/layouts/dashboard/demo-banner.tsx -->

"use client";

import { AlertTriangle } from 'lucide-react';
import { Alert } from '../../../../components/ui/alert';

export function DemoBanner() {
  return (
    <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/20">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <p className="text-sm ml-2">
        You are currently using a demo account. Some features may be limited.
      </p>
    </Alert>
  );
}