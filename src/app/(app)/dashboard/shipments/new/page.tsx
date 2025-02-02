// src/app/(app)/dashboard/shipments/new/page.tsx -->

"use client";

import { CreateShipmentForm } from '@/components/shipments/forms/create-shipment-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewShipmentPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Shipment</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/shipments">Cancel</Link>
        </Button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <CreateShipmentForm />
      </div>
    </div>
  );
}