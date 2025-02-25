import { ErrorLogger } from '@/lib/errors/logger';
import { ShippingDetails } from '../types';

interface ExtractionPattern {
  field: keyof ShippingDetails;
  patterns: RegExp[];
  validator?: (value: string) => boolean;
  transformer?: (value: string) => any;
}

interface ShippingConfig {
  supportedRegions: string[];
  serviceTypes: string[];
  specialHandlingOptions: string[];
}

export class ShippingInfoExtractor {
  private readonly patterns: ExtractionPattern[] = [
    {
      field: 'origin',
      patterns: [
        /from\s+([^,\.]+)/i,
        /shipping\s+from\s+([^,\.]+)/i,
        /send.*from\s+([^,\.]+)/i
      ],
      validator: (value: string) => this.isValidLocation(value)
    },
    {
      field: 'destination',
      patterns: [
        /to\s+([^,\.]+)/i,
        /shipping\s+to\s+([^,\.]+)/i,
        /deliver.*to\s+([^,\.]+)/i
      ],
      validator: (value: string) => this.isValidLocation(value)
    },
    {
      field: 'weight',
      patterns: [
        /(\d+(?:\.\d+)?)\s*(?:kg|kilos?|pounds?|lbs?)/i,
        /weighs?\s+(\d+(?:\.\d+)?)/i
      ],
      transformer: (value: string) => this.normalizeWeight(value)
    },
    {
      field: 'dimensions',
      patterns: [
        /(\d+)\s*x\s*(\d+)\s*x\s*(\d+)(?:\s*(?:cm|in))?/i,
        /dimensions?:?\s*(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i
      ],
      transformer: (match: string) => this.parseDimensions(match)
    },
    {
      field: 'serviceType',
      patterns: [
        /(?:want|need|prefer)\s+(standard|express|overnight)/i,
        /(standard|express|overnight)\s+shipping/i,
        /(standard|express|overnight)\s+delivery/i
      ],
      validator: (value: string) => this.config.serviceTypes.includes(value.toLowerCase())
    }
  ];

  constructor(private readonly config: ShippingConfig) {}

  async extract(input: string): Promise<Partial<ShippingDetails>> {
    try {
      const extractedInfo: Partial<ShippingDetails> = {};
      
      // Extract information using patterns
      for (const pattern of this.patterns) {
        const value = this.extractField(input, pattern);
        if (value !== undefined) {
          extractedInfo[pattern.field] = value;
        }
      }

      // Extract special handling requirements
      const specialHandling = this.extractSpecialHandling(input);
      if (specialHandling.length > 0) {
        extractedInfo.specialHandling = specialHandling;
      }

      return extractedInfo;

    } catch (error) {
      ErrorLogger.error('Error extracting shipping information:', error as Error);
      return {};
    }
  }

  private extractField(input: string, pattern: ExtractionPattern): any {
    for (const regex of pattern.patterns) {
      const match = input.match(regex);
      if (match) {
        const value = pattern.transformer 
          ? pattern.transformer(match[0])
          : match[1];

        if (!pattern.validator || pattern.validator(value)) {
          return value;
        }
      }
    }
    return undefined;
  }

  private extractSpecialHandling(input: string): string[] {
    return this.config.specialHandlingOptions.filter(option =>
      new RegExp(`\\b${option}\\b`, 'i').test(input)
    );
  }

  private isValidLocation(location: string): boolean {
    // Basic validation - check if location is in supported regions
    const normalizedLocation = location.toLowerCase().trim();
    return this.config.supportedRegions.some(region =>
      normalizedLocation.includes(region.toLowerCase())
    );
  }

  private normalizeWeight(weightStr: string): number {
    const match = weightStr.match(/(\d+(?:\.\d+)?)\s*(kg|kilos?|pounds?|lbs?)/i);
    if (!match) return 0;

    const [, value, unit] = match;
    const numericValue = parseFloat(value);

    // Convert to kilograms if necessary
    if (unit.toLowerCase().startsWith('lb')) {
      return numericValue * 0.453592; // Convert pounds to kilograms
    }
    return numericValue;
  }

  private parseDimensions(dimensionsStr: string): { length: number; width: number; height: number } {
    const dimensions = dimensionsStr.match(/\d+/g)?.map(Number) || [];
    if (dimensions.length !== 3) {
      throw new Error('Invalid dimensions format');
    }

    const [length, width, height] = dimensions;
    return { length, width, height };
  }
} 