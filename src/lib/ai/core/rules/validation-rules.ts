import { ProcessingRule } from '../types';

export function createValidationRule(
  id: string,
  validator: (data: any) => boolean,
  errorMessage: string
): ProcessingRule {
  return {
    id,
    type: 'validation',
    condition: (data) => true, // Always run validations
    action: async (data) => {
      if (!validator(data)) {
        throw new Error(`Validation failed: ${errorMessage}`);
      }
      return data;
    }
  };
}

export const commonValidationRules = {
  requiredFields: (fields: string[]): ProcessingRule => 
    createValidationRule(
      'required-fields',
      (data) => fields.every(field => !!data[field]),
      `Missing required fields: ${fields.join(', ')}`
    ),

  numericRange: (field: string, min: number, max: number): ProcessingRule =>
    createValidationRule(
      'numeric-range',
      (data) => {
        const value = data[field];
        return typeof value === 'number' && value >= min && value <= max;
      },
      `${field} must be between ${min} and ${max}`
    ),

  dateRange: (field: string, minDate?: Date, maxDate?: Date): ProcessingRule =>
    createValidationRule(
      'date-range',
      (data) => {
        const date = new Date(data[field]);
        if (minDate && date < minDate) return false;
        if (maxDate && date > maxDate) return false;
        return true;
      },
      `${field} must be within valid date range`
    )
};