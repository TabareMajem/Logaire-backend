// src/components/shipments/detail/tabs/documents.tsx -->

"use client";

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { DocumentList } from '../documents/document-list';
import { DocumentUpload } from '../documents/document-upload';
import { fetchShipmentDocuments } from '@/lib/api/documents';

interface ShipmentDocumentsProps {
  shipmentId: string;
}

export function ShipmentDocuments({ shipmentId }: ShipmentDocumentsProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['shipment-documents', shipmentId],
    queryFn: () => fetchShipmentDocuments(shipmentId)
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Documents</h2>
        <DocumentUpload shipmentId={shipmentId} />
      </div>

      <Card className="p-6">
        <DocumentList 
          documents={documents} 
          isLoading={isLoading} 
          shipmentId={shipmentId}
        />
      </Card>
    </div>
  );
}