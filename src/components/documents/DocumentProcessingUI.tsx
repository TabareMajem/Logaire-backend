// src/components/documents/DocumentProcessingUI.tsx -->

import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { DocumentType } from '@/lib/ai/document/validation/document-validator';
import { AlertCircle, FileText, Upload } from 'lucide-react';
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';

interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

export function DocumentProcessingUI() {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('invoice');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0
  });

  const {
    processDocument,
    isProcessing,
    error,
    validationResults,
    extractedEntities
  } = useDocumentProcessing();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProcessingStatus({ status: 'uploading', progress: 0 });
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setProcessingStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      await processDocument(file, selectedDocType);
      
      clearInterval(interval);
      setProcessingStatus({ status: 'completed', progress: 100 });
    } catch (err) {
      setProcessingStatus({
        status: 'failed',
        progress: 0,
        message: (err as Error).message
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Document Processing</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
            className="rounded-md border p-2"
          >
            <option value="invoice">Invoice</option>
            <option value="bill_of_lading">Bill of Lading</option>
            <option value="packing_list">Packing List</option>
            <option value="customs_declaration">Customs Declaration</option>
          </select>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </Button>
        </div>
      </div>

      {processingStatus.status !== 'idle' && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {processingStatus.status.charAt(0).toUpperCase() + 
                 processingStatus.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                {processingStatus.progress}%
              </span>
            </div>
            <Progress value={processingStatus.progress} />
            {processingStatus.message && (
              <p className="text-sm text-gray-500">{processingStatus.message}</p>
            )}
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="validation">
        <TabsList>
          <TabsTrigger value="validation">Validation Results</TabsTrigger>
          <TabsTrigger value="extraction">Extracted Data</TabsTrigger>
          <TabsTrigger value="preview">Document Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="validation">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Validation Results</h3>
            {validationResults && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={validationResults.isValid ? 'outline' : 'destructive'}>
                    {validationResults.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Confidence: {(validationResults.metadata.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {validationResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Validation Errors:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResults.errors.map((error: { field: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; message: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }, index: Key | null | undefined) => (
                        <li key={index} className="text-sm text-red-600">
                          {error.field}: {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="extraction">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Extracted Entities</h3>
            {extractedEntities && (
              <div className="space-y-4">
                {extractedEntities.entities.map((entity: { type: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; value: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; confidence: number; }, index: Key | null | undefined) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{entity.type}</h4>
                        <p className="text-sm">{entity.value}</p>
                      </div>
                      <Badge variant="outline">
                        {(entity.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Document Preview</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Document preview will be displayed here
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 