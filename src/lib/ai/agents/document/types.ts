export interface DocumentData {
  id: string;
  filename: string;
  type: 'bill_of_lading' | 'invoice' | 'packing_list' | 'other';
  content: Buffer | string;
  metadata?: Record<string, any>;
}

export interface OCRResult {
  rawText: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  structuredData: Record<string, any>;
  metadata: {
    processedAt: string;
    documentType: string;
    originalFileName: string;
  };
}

export interface DocumentProcessingResult {
  documentId: string;
  status: 'success' | 'error';
  ocr?: OCRResult;
  error?: string;
  processingTime: number;
}

export interface DocumentAgentConfig {
  supportedTypes: string[];
  ocrConfig: {
    language: string;
    enhanceImage: boolean;
    confidenceThreshold: number;
  };
  processingRules: {
    maxRetries: number;
    timeoutMs: number;
    batchSize: number;
  };
}

export interface DocumentProcessingConfig {
  type: 'ocr' | 'classification' | 'extraction';
  model: string;
  confidence: number;
  maxPages?: number;
  timeout?: number;
}

export interface ProcessingResult {
  success: boolean;
  data: any;
  confidence: number;
  processingTime: number;
  metadata: Record<string, any>;
}