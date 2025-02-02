// src/app/(app)/dashboard/documents/page.tsx -->

"use client";

import { DocumentList } from '@/components/shipments/detail/documents/document-list';
import { DocumentUpload } from '@/components/shipments/detail/documents/document-upload';
import { RecentDocuments } from '@/components/dashboard/documents/recent-documents';
import { DocumentPage } from '@/components/shipments/detail/documents/document-page'

export default function DocumentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* <h1 className="text-2xl font-bold">Documents</h1>
      <DocumentUpload shipmentId={''} />
      <RecentDocuments />
      <DocumentList isLoading={false} shipmentId={''} /> */}
      <DocumentPage/>
    </div>
  );
}