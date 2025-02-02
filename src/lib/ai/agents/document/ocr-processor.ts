import { ErrorLogger } from '@/lib/errors/logger';
import { createWorker } from 'tesseract.js';
import { DocumentData, OCRResult } from './types';

export class OCRProcessor {
  private static instance: OCRProcessor;
  private worker: Tesseract.Worker | null = null;

  private constructor() {}

  static getInstance(): OCRProcessor {
    if (!this.instance) {
      this.instance = new OCRProcessor();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.worker = await createWorker('eng');
    } catch (error) {
      ErrorLogger.error('Failed to initialize OCR worker:', error as Error);
      throw error;
    }
  }

  async processDocument(document: DocumentData): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    try {
      const { data: { text, confidence, words } } = await this.worker!.recognize(document.content);

      // Extract structured data based on document type
      const structuredData = await this.extractStructuredData(text, document.type);

      return {
        rawText: text,
        confidence,
        words: words.map(w => ({
          text: w.text,
          confidence: w.confidence,
          bbox: w.bbox
        })),
        structuredData,
        metadata: {
          processedAt: new Date().toISOString(),
          documentType: document.type,
          originalFileName: document.filename
        }
      };
    } catch (error) {
      ErrorLogger.error('OCR processing failed:', error as Error);
      throw error;
    }
  }

  private async extractStructuredData(text: string, documentType: string): Promise<Record<string, any>> {
    // Add document-specific extraction logic
    switch (documentType) {
      case 'bill_of_lading':
        return this.extractBillOfLadingData(text);
      case 'invoice':
        return this.extractInvoiceData(text);
      case 'packing_list':
        return this.extractPackingListData(text);
      default:
        return {};
    }
  }

  private extractBillOfLadingData(text: string): Record<string, any> {
    // Implement BOL-specific extraction logic
    const data = {
      bookingNumber: this.extractPattern(text, /Booking\s*#?\s*:?\s*([A-Z0-9]+)/i),
      containerNumbers: this.extractPattern(text, /Container\s*#?\s*:?\s*([A-Z0-9]+)/ig),
      shipper: this.extractBetween(text, 'Shipper', 'Consignee'),
      consignee: this.extractBetween(text, 'Consignee', 'Notify Party'),
      vessel: this.extractPattern(text, /Vessel\s*:?\s*([A-Za-z0-9\s]+)/i),
      voyage: this.extractPattern(text, /Voyage\s*#?\s*:?\s*([A-Z0-9]+)/i),
    };

    return data;
  }

  private extractInvoiceData(text: string): Record<string, any> {
    // Implement invoice-specific extraction logic
    const data = {
      invoiceNumber: this.extractPattern(text, /Invoice\s*#?\s*:?\s*([A-Z0-9]+)/i),
      date: this.extractPattern(text, /Date\s*:?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i),
      amount: this.extractPattern(text, /Total\s*:?\s*\$?\s*(\d+,?\d*\.?\d*)/i),
      currency: this.extractPattern(text, /Currency\s*:?\s*([A-Z]{3})/i),
    };

    return data;
  }

  private extractPackingListData(text: string): Record<string, any> {
    // Implement packing list-specific extraction logic
    const data = {
      packageCount: this.extractPattern(text, /Total\s*Packages?\s*:?\s*(\d+)/i),
      weight: this.extractPattern(text, /Total\s*Weight\s*:?\s*(\d+\.?\d*)\s*(KG|LB)/i),
      dimensions: this.extractPattern(text, /Dimensions\s*:?\s*(\d+x\d+x\d+)/i),
    };

    return data;
  }

  private extractPattern(text: string, pattern: RegExp): string | null {
    const match = text.match(pattern);
    return match ? match[1] : null;
  }

  private extractBetween(text: string, startMarker: string, endMarker: string): string | null {
    const pattern = new RegExp(`${startMarker}\\s*:?\\s*([\\s\\S]*?)\\s*${endMarker}`);
    return this.extractPattern(text, pattern);
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrProcessor = OCRProcessor.getInstance();
