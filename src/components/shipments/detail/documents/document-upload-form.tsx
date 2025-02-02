// src/components/shipments/details/documents/document-upload-form.tsx -->

"use client";

import { useState } from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Button } from '../../../../../components/ui/button';
import { FilePlus } from 'lucide-react';

interface DocumentUploadFormProps {
  shipmentId: string;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export function DocumentUploadForm({
  shipmentId,
  onSubmit,
  isLoading
}: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && documentName) {
      const formData = new FormData();
      formData.append('shipmentId', shipmentId);
      formData.append('file', file);
      formData.append('documentName', documentName);
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="document-name">Document Name</Label>
        <Input
          id="document-name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="Enter document name"
          required
        />
      </div>

      <div>
        <Label htmlFor="file-upload">Upload File</Label>
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          required
          accept="application/pdf, image/*"
          className="block w-full text-sm text-gray-500"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <FilePlus className="h-4 w-4" />
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </form>
  );
}
