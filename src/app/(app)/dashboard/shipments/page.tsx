// src/app/(app)/dashboard/shipments/page.tsx -->

"use client";

import { ShipmentsList } from '@/components/shipments/shipments-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ShipmentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipments</h1>
        <Button asChild>
          <Link href="/dashboard/shipments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Link>
        </Button>
      </div>
      <ShipmentsList />
    </div>
  );
}