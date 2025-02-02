export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class ValidationError extends AIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class ExecutionError extends AIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'EXECUTION_ERROR', context);
    this.name = 'ExecutionError';
  }
}

export class ConfigurationError extends AIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigurationError';
  }
}

export class ModelError extends AIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'MODEL_ERROR', context);
    this.name = 'ModelError';
  }
} 