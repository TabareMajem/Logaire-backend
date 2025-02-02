import { ErrorLogger } from '@/lib/errors/logger';
import { metricsService } from '@/services/metrics-service';
import { BaseAgent } from '../base/base-agent';
import { ocrProcessor } from './ocr-processor';
import { DocumentAgentConfig, DocumentData, DocumentProcessingResult } from './types';

export class DocumentAgent extends BaseAgent {
  private config: DocumentAgentConfig;
  private processingQueue: DocumentData[] = [];
  private processing: boolean = false;

  constructor(config: DocumentAgentConfig) {
    super({
      id: 'document-agent',
      type: 'document',
      enabled: true
    });
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      await ocrProcessor.initialize();
      this.isRunning = true;
      this.processQueue();
    } catch (error) {
      ErrorLogger.error('Failed to start document agent:', error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await ocrProcessor.terminate();
      this.isRunning = false;
    } catch (error) {
      ErrorLogger.error('Failed to stop document agent:', error as Error);
      throw error;
    }
  }

  async processDocument(document: DocumentData): Promise<DocumentProcessingResult> {
    if (!this.isRunning) {
      throw new Error('Document agent is not running');
    }

    if (!this.config.supportedTypes.includes(document.type)) {
      throw new Error(`Unsupported document type: ${document.type}`);
    }

    const startTime = Date.now();

    try {
      // Process document with OCR
      const ocrResult = await ocrProcessor.processDocument(document);

      // Record metrics
      await metricsService.insertMetrics([{
        type: 'document_processing',
        value: Date.now() - startTime,
        metadata: {
          documentType: document.type,
          confidence: ocrResult.confidence
        }
      }]);

      return {
        documentId: document.id,
        status: 'success',
        ocr: ocrResult,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      ErrorLogger.error('Document processing failed:', error as Error);
      return {
        documentId: document.id,
        status: 'error',
        error: (error as Error).message,
        processingTime: Date.now() - startTime
      };
    }
  }

  async onMessage(message: any): Promise<void> {
    if (message.type === 'process_document') {
      this.processingQueue.push(message.document);
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.processingQueue.length === 0) return;

    this.processing = true;

    try {
      while (this.processingQueue.length > 0) {
        const batch = this.processingQueue.splice(0, this.config.processingRules.batchSize);
        const results = await Promise.all(
          batch.map(doc => this.processDocument(doc))
        );

        // Emit results
        results.forEach(result => {
          this.emit('documentProcessed', result);
        });
      }
    } catch (error) {
      ErrorLogger.error('Queue processing failed:', error as Error);
    } finally {
      this.processing = false;
    }
  }
}