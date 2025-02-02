// src/components/shipments/details/documents/document-upload.tsx -->

"use client";

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../components/ui/dialog';
import { DocumentUploadForm } from './document-upload-form';
import { uploadDocument } from '@/lib/api/documents';
import { useToast } from '@/hooks/use-toast';
import type { DocumentType } from '@/types'; // Assuming you have these types defined

interface DocumentUploadProps {
  shipmentId: string;
}

// Define the upload document parameters type
type UploadDocumentParams = {
  shipmentId: string;
  type: DocumentType;
  file: File;
  metadata?: Record<string, any>;
};

export function DocumentUpload({ shipmentId }: DocumentUploadProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: (params: UploadDocumentParams) => uploadDocument(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['shipment-documents', shipmentId] 
      });
      toast.success('Document uploaded successfully');
      setOpen(false);
    },
    onError: () => {
      toast.error('Failed to upload document');
    }
  });

  const onSubmit = (formData: FormData) => {
    const file = formData.get('file') as File;
    const type = formData.get('type') as DocumentType;
    const metadata = formData.get('metadata') as Record<string, any> | undefined;

    handleUpload({
      shipmentId,
      type,
      file,
      metadata
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <DocumentUploadForm
          shipmentId={shipmentId}
          onSubmit={onSubmit}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}