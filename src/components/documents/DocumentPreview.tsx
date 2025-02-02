// src/components/documents/DocumentPreview.tsx -->

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorLogger } from '@/lib/errors/logger';
import { Loader2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';


interface DocumentPreviewProps {
  file: File | string; // Can be a File object or URL
  onError?: (error: Error) => void;
}

export function DocumentPreview({ file, onError }: DocumentPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let url: string;
    
    if (typeof file === 'string') {
      url = file;
    } else {
      url = URL.createObjectURL(file);
    }

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        
        // Dynamically import PDF.js
        const pdfjsLib = await import('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const document = await pdfjsLib.getDocument(url).promise;
        setPdfDocument(document);
        setTotalPages(document.numPages);
        await renderPage(document, currentPage);
      } catch (error) {
        ErrorLogger.error('Error loading document:', error as Error);
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
        if (typeof file === 'object') {
          URL.revokeObjectURL(url);
        }
      }
    };

    loadDocument();
  }, [file]);

  const renderPage = async (doc: any, pageNumber: number) => {
    if (!canvasRef.current) return;

    try {
      const page = await doc.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      const viewport = page.getViewport({ 
        scale: scale, 
        rotation: rotation 
      });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport
      }).promise;
    } catch (error) {
      ErrorLogger.error('Error rendering page:', error as Error);
      onError?.(error as Error);
    }
  };

  const handleZoomIn = () => {
    const newScale = scale * 1.2;
    setScale(newScale);
    if (pdfDocument) {
      renderPage(pdfDocument, currentPage);
    }
  };

  const handleZoomOut = () => {
    const newScale = scale * 0.8;
    setScale(newScale);
    if (pdfDocument) {
      renderPage(pdfDocument, currentPage);
    }
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (pdfDocument) {
      renderPage(pdfDocument, currentPage);
    }
  };

  const handlePageChange = async (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (pdfDocument) {
        await renderPage(pdfDocument, newPage);
      }
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={isLoading}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={isLoading}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            disabled={isLoading}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(-1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="relative border rounded-lg overflow-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="max-w-full"
        />
      </div>
    </Card>
  );
} 