// src/hooks/useDocumentProcessing.ts
import { useState } from 'react';
import { DocumentType } from '@/lib/ai/document/validation/document-validator';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  metadata: {
    confidence: number;
  };
}

interface ExtractedEntity {
  type: string;
  value: string | number;
  confidence: number;
}

interface ExtractedEntities {
  entities: ExtractedEntity[];
}

export function useDocumentProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntities | null>(null);

  const processDocument = async (file: File, documentType: DocumentType) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      // Simulate API call for document validation
      // Replace this with your actual API endpoint
      const validationResponse = await fetch('/api/documents/validate', {
        method: 'POST',
        body: formData,
      });

      if (!validationResponse.ok) {
        throw new Error('Document validation failed');
      }

      const validationData = await validationResponse.json();
      setValidationResults(validationData);

      // Only proceed with extraction if validation passed
      if (validationData.isValid) {
        // Simulate API call for entity extraction
        // Replace this with your actual API endpoint
        const extractionResponse = await fetch('/api/documents/extract', {
          method: 'POST',
          body: formData,
        });

        if (!extractionResponse.ok) {
          throw new Error('Entity extraction failed');
        }

        const extractionData = await extractionResponse.json();
        setExtractedEntities(extractionData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcessing = () => {
    setIsProcessing(false);
    setError(null);
    setValidationResults(null);
    setExtractedEntities(null);
  };

  return {
    processDocument,
    resetProcessing,
    isProcessing,
    error,
    validationResults,
    extractedEntities,
  };
}