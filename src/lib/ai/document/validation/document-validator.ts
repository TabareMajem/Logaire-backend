import { ErrorLogger } from '@/lib/errors/logger';
import { metricsCollector } from '@/lib/monitoring/metrics/metrics-collector';

export type DocumentType = 'invoice' | 'bill_of_lading' | 'packing_list' | 'customs_declaration';

interface ValidationRule {
  id: string;
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  condition: ValidationCondition;
  errorMessage: string;
}

interface ValidationCondition {
  pattern?: RegExp;
  min?: number;
  max?: number;
  validate?: (value: any) => boolean;
  customValidator?: (value: any) => Promise<boolean>;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  metadata: {
    documentType: DocumentType;
    validationTime: number;
    confidence: number;
  };
}

interface ValidationError {
  field: string;
  message: string;
  ruleId: string;
}

export class DocumentValidator {
  private rules: Map<DocumentType, ValidationRule[]>;

  constructor() {
    this.rules = new Map();
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Invoice validation rules
    this.addRules('invoice', [
      {
        id: 'inv_number',
        field: 'invoiceNumber',
        type: 'required',
        condition: { pattern: /^[A-Z0-9]{3,20}$/ },
        errorMessage: 'Invalid invoice number format'
      },
      {
        id: 'inv_date',
        field: 'invoiceDate',
        type: 'required',
        condition: {
          validate: (value) => !isNaN(Date.parse(value))
        },
        errorMessage: 'Invalid invoice date'
      },
      {
        id: 'inv_amount',
        field: 'totalAmount',
        type: 'required',
        condition: {
          validate: (value) => typeof value === 'number' && value > 0
        },
        errorMessage: 'Invalid total amount'
      }
    ]);

    // Bill of Lading validation rules
    this.addRules('bill_of_lading', [
      {
        id: 'bol_number',
        field: 'blNumber',
        type: 'required',
        condition: { pattern: /^[A-Z]{4}[0-9]{8}$/ },
        errorMessage: 'Invalid B/L number format'
      },
      {
        id: 'bol_containers',
        field: 'containers',
        type: 'required',
        condition: {
          validate: (value) => Array.isArray(value) && value.length > 0
        },
        errorMessage: 'Container information is required'
      }
    ]);
  }

  async validateDocument(
    documentType: DocumentType,
    data: any
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    let confidence = 1.0;

    try {
      const rules = this.rules.get(documentType) || [];
      
      for (const rule of rules) {
        const value = data[rule.field];
        const isValid = await this.validateField(value, rule);
        
        if (!isValid) {
          errors.push({
            field: rule.field,
            message: rule.errorMessage,
            ruleId: rule.id
          });
          confidence *= 0.8; // Reduce confidence for each error
        }
      }

      const validationTime = Date.now() - startTime;
      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        metadata: {
          documentType,
          validationTime,
          confidence
        }
      };

      // Record metrics
      await this.recordValidationMetrics(documentType, result);

      return result;
    } catch (error) {
      ErrorLogger.error('Document validation error:', error as Error);
      throw error;
    }
  }

  private async validateField(
    value: any,
    rule: ValidationRule
  ): Promise<boolean> {
    try {
      if (rule.type === 'required' && (value === undefined || value === null)) {
        return false;
      }

      const { condition } = rule;

      if (condition.pattern && typeof value === 'string') {
        return condition.pattern.test(value);
      }

      if (condition.validate) {
        return condition.validate(value);
      }

      if (condition.customValidator) {
        return await condition.customValidator(value);
      }

      if (typeof value === 'number') {
        if (condition.min !== undefined && value < condition.min) return false;
        if (condition.max !== undefined && value > condition.max) return false;
      }

      return true;
    } catch (error) {
      ErrorLogger.error('Field validation error:', error as Error);
      return false;
    }
  }

  addRules(documentType: DocumentType, rules: ValidationRule[]): void {
    const existingRules = this.rules.get(documentType) || [];
    this.rules.set(documentType, [...existingRules, ...rules]);
  }

  private async recordValidationMetrics(
    documentType: DocumentType,
    result: ValidationResult
  ): Promise<void> {
    await metricsCollector.recordMetric(
      'document_processing',
      result.isValid ? 1 : 0,
      {
        type: documentType,
        operation: 'validation'
      },
      {
        validationTime: result.metadata.validationTime,
        confidence: result.metadata.confidence,
        errorCount: result.errors.length
      }
    );
  }
}

export const documentValidator = new DocumentValidator(); 