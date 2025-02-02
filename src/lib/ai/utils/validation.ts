export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

export function validateNumericRange(
  value: number,
  min?: number,
  max?: number,
  fieldName: string = 'Value'
): void {
  if (min !== undefined && value < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== undefined && value > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }
}

export function validateDateRange(
  start: Date,
  end: Date,
  fieldName: string = 'Date range'
): void {
  if (start >= end) {
    throw new Error(`${fieldName} start must be before end`);
  }
}