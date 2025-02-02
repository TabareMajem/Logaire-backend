// src/components/shipments/details/documents/document-list.tsx -->

"use client";

import { ShipmentDocument } from '@/lib/api/documents';
import { DocumentCard } from './document-card';
import { DocumentListSkeleton } from './document-list-skeleton';

interface DocumentListProps {
  documents?: ShipmentDocument[];
  isLoading: boolean;
  shipmentId: string;
}

export function DocumentList({ documents, isLoading, shipmentId }: DocumentListProps) {
  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <DocumentCard 
          key={document.id} 
          document={document}
          shipmentId={shipmentId}
        />
      ))}
    </div>
  );
}