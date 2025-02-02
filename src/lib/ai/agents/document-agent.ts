import { ErrorLogger } from '@/lib/errors/logger';
import { EnhancedBaseAgent } from './base/enhanced-base-agent';
import { AgentResult, AgentTask } from './base/types';

interface DocumentAnalysisResult {
  documentType: string;
  confidence: number;
  extractedData: Record<string, any>;
  validationResults: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export class DocumentAgent extends EnhancedBaseAgent {
  private readonly supportedDocumentTypes = [
    'bill_of_lading',
    'commercial_invoice',
    'packing_list',
    'customs_declaration',
    'certificate_of_origin'
  ];

  private readonly documentPrompts = {
    analyze: `Analyze the following shipping document and provide:
1. Document type classification
2. Key information extraction
3. Validation results
4. Confidence score

Document content:
{{documentContent}}

Required validations:
{{validationRules}}

Respond in the following JSON format:
{
  "documentType": "string",
  "confidence": number,
  "extractedData": object,
  "validationResults": {
    "isValid": boolean,
    "errors": string[],
    "warnings": string[]
  }
}`,

    extract: `Extract all relevant information from the following document:
{{documentContent}}

Focus on:
- Dates and reference numbers
- Party information (shipper, consignee, notify party)
- Cargo details (description, weight, volume)
- Transport details (vessel, voyage, ports)
- Commercial terms and conditions

Provide the extracted data in a structured JSON format.`,

    validate: `Validate the following document data against the provided rules:
{{documentContent}}

Validation rules:
{{rules}}

Check for:
1. Completeness of required fields
2. Data format compliance
3. Business logic validation
4. Cross-reference validation

Provide detailed validation results including any errors or warnings.`
  };

  protected getAgentType(): string {
    return 'document';
  }

  protected getContext(): Record<string, any> {
    return {
      supportedTypes: this.supportedDocumentTypes,
      validationRules: this.getValidationRules()
    };
  }

  protected async processTask(
    task: AgentTask,
    model: string,
    prompt: string
  ): Promise<AgentResult> {
    try {
      switch (task.type) {
        case 'analyze':
          return await this.analyzeDocument(task, model, prompt);
        case 'extract':
          return await this.extractInformation(task, model, prompt);
        case 'validate':
          return await this.validateDocument(task, model, prompt);
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
    } catch (error) {
      ErrorLogger.error('Document processing failed', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0
      };
    }
  }

  private async analyzeDocument(
    task: AgentTask,
    model: string,
    prompt: string
  ): Promise<AgentResult> {
    const response = await this.anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ 
        role: 'user', 
        content: this.formatPrompt(this.documentPrompts.analyze, task.input)
      }],
      system: this.getSystemPrompt()
    });

    const result = this.parseResponse(response.messages[0].content) as DocumentAnalysisResult;

    return {
      success: true,
      data: result,
      confidence: result.confidence,
      metadata: {
        documentType: result.documentType,
        validationStatus: result.validationResults.isValid ? 'valid' : 'invalid'
      }
    };
  }

  private async extractInformation(
    task: AgentTask,
    model: string,
    prompt: string
  ): Promise<AgentResult> {
    // Implementation for information extraction
    // Similar to analyzeDocument but focused on data extraction
    return { success: false, confidence: 0 };
  }

  private async validateDocument(
    task: AgentTask,
    model: string,
    prompt: string
  ): Promise<AgentResult> {
    // Implementation for document validation
    // Similar to analyzeDocument but focused on validation
    return { success: false, confidence: 0 };
  }

  private getSystemPrompt(): string {
    return `You are a specialized document analysis agent trained to:
1. Classify shipping documents with high accuracy
2. Extract structured information
3. Validate against business rules
4. Provide confidence scores

Always maintain strict attention to detail and data accuracy.`;
  }

  private formatPrompt(template: string, data: Record<string, any>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
      prompt = prompt.replace(`{{${key}}}`, JSON.stringify(value, null, 2));
    }
    return prompt;
  }

  private getValidationRules(): Record<string, any> {
    return {
      required_fields: {
        bill_of_lading: [
          'bl_number',
          'shipper',
          'consignee',
          'vessel',
          'port_of_loading',
          'port_of_discharge'
        ],
        commercial_invoice: [
          'invoice_number',
          'date',
          'seller',
          'buyer',
          'total_amount',
          'currency'
        ]
        // Add rules for other document types
      },
      format_rules: {
        bl_number: '^[A-Z]{3}[0-9]{7}$',
        date: '^\\d{4}-\\d{2}-\\d{2}$',
        amount: '^\\d+(\\.\\d{2})?$'
      }
    };
  }

  private parseResponse(content: string): DocumentAnalysisResult {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse AI response');
    }
  }
} 